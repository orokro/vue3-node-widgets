/*
	ConnectionManager.js
	--------------------

	This will store all the wires connecting the nodes.

	This will both be used to provide the state for the templates to render
	the wires as SVG curves, but will also handle the wiring plumbing logic
	for the nodes.

	This will also handle some of the state logic for when nodes are being
	added.
*/

import { shallowRef } from "vue";
import NWEditor from "./NWEditor";
import { Connection } from "./Connection";
import NWNode, { SOCKET_TYPE } from "./NWNode";

export class ConnectionManager {

	/**
	 * Constructs a new ConnectionManager instance.
	 * 
	 * @param {NWEditor} editor - the NWEditor instance that this ConnectionManager will be associated with.
	 */
	constructor(editor) {

		// save the editor instance
		this.editor = editor;

		// the wires array
		this.wires = this.editor.graph.wires;

		// while the user is dragging out a wire, we'll store some state here
		this.draggingWire = shallowRef(false);
		this.dragEnd = shallowRef(SOCKET_TYPE.OUTPUT);
		this.dragOriginNode = shallowRef(null);
		this.dragOriginField = shallowRef(null);
		this.dragCurrentPos = shallowRef({ x: 0, y: 0 });
	}


	/**
	 * Adds a new connection with basic start and end positions.
	 * 
	 * @param {Number} startX - the start X position of the connection.
	 * @param {Number} startY - the start Y position of the connection.
	 * @param {Number} endX - the end X position of the connection.
	 * @param {Number} endY - the end Y position of the connection.
	 * @returns {Connection} - the newly created connection instance.
	 */
	addConnectionBasic(startX, startY, endX, endY) {

		// ensure we have valid positions
		startX = startX || 0;
		startY = startY || 0;
		endX = endX || 0;
		endY = endY || 0;

		// create a new connection
		const conn = new Connection(this);

		// set the positions
		conn.positions.startX = startX;
		conn.positions.startY = startY;
		conn.positions.endX = endX;
		conn.positions.endY = endY;

		// add to the wires array
		this.wires.value = [...this.wires.value, conn];

		return conn;
	}

	
	/**
	 * Destroy a connection.
	 * 
	 * @param {Connection|String} conn - the connection to destroy, or the ID of the connection to destroy.
	 */
	destroyConnection(conn) {

		// if conn is a string, then it's an ID
		if (typeof conn === 'string') {
			conn = this.wires.value.find(c => c.id === conn);
		}

		// remove the connection from the wires array
		this.wires.value = this.wires.value.filter(c => c.id !== conn.id);
	}


	/**
	 * Starts dragging a wire from a node's socket.
	 * 
	 * @param {NWNode} node - the node that the wire is being started from.
	 * @param {Object} field - the field on the node that the wire is being started from.
	 * @param {Boolean} startFromOutput - whether the wire is being started from an output socket (true) or an input socket (false).
	 * @param {MouseEvent} event - the mouse event that triggered the wire start (if applicable).
	 * @returns {void}
	 */
	startWire(node, field, startFromOutput = true, event) {

		// save our stats about our drag origin
		// note on this: users can drag from an output socket or an input socket
		// so we need to note which end of the wire is attached to the mouse
		this.dragEnd.value = startFromOutput ? SOCKET_TYPE.OUTPUT : SOCKET_TYPE.INPUT;
		this.dragOriginNode.value = node;
		this.dragOriginField.value = field;

		// true while dragging
		this.draggingWire.value = true;

		// add a new connection, we'll fill in the positions later
		const conn = this.addConnectionBasic();

		// we'll store the initial scale of zoom when drag was started incase someone zoom-scrolls while dragging
		const startScale = this.editor.zoomScale.value;

		// set the start & node the positions
		let startX = 0;
		let startY = 0;
		if( startFromOutput ) {
			
			// the INPUT for the wire is an output socket
			conn.setInput(node, field);
			startX = conn.positions.endX = conn.positions.startX;
			startY = conn.positions.endY = conn.positions.startY;

		}else {
			// the OUTPUT for the wire is an input socket
			conn.setOutput(node, field);
			startX = conn.positions.startX = conn.positions.endX;
			startY = conn.positions.startY = conn.positions.endY;
		}

		this.attachWireDrag(conn, startFromOutput, startX, startY, event);

		
		return conn;
	}


	/**
	 * Helper to convert screen coordinates to world coordinates.
	 * 
	 * @param {Number} clientX - the X position of the mouse in screen coordinates.
	 * @param {Number} clientY - the Y position of the mouse in screen coordinates.
	 * @returns {Object} - an object with the world coordinates of the mouse position, adjusted for the current pan and zoom.
	 */
	screenToWorld(clientX, clientY) {

		const scale = this.editor.zoomScale.value;
		const panX = this.editor.panX.value;
		const panY = this.editor.panY.value;
		return {
			x: (clientX - panX) / scale,
			y: (clientY - panY) / scale
		};
	}


	/**
	 * Does the drag-logic for a new wire connection.
	 * 
	 * @param {Connection} conn - the connection to attach the drag handler to.
	 * @param {Boolean} startFromOutput - whether the wire is being started from an output socket (true) or an input socket (false).
	 * @param {Number} startX - the X position to start dragging from.
	 * @param {Number} startY - the Y position to start dragging from.	
	 * @param {MouseEvent} startEvent - the mouse event that triggered the wire start (if applicable).
	 */
	attachWireDrag(conn, startFromOutput, startX, startY, startEvent) {

		//	mouse screen position at drag start
		const startClientX = startEvent?.clientX ?? 0;
		const startClientY = startEvent?.clientY ?? 0;
	
		//	mouse world position at drag start
		const startMouseWorld = this.screenToWorld(startClientX, startClientY);
	
		//	world pos of the grabbed end at drag start
		const startWorldX = startX;
		const startWorldY = startY;
	
		//	fixed offset so the grabbed point stays under the cursor
		const grabOffsetX = startWorldX - startMouseWorld.x;
		const grabOffsetY = startWorldY - startMouseWorld.y;
	
		this.editor.dragHelper.dragStart(
			(dx, dy) => {
				//	reconstruct current mouse screen pos from cumulative deltas
				const curClientX = startClientX - dx;
				const curClientY = startClientY - dy;
	
				//	project through the *current* view (handles mid-drag zoom/pan)
				const curMouseWorld = this.screenToWorld(curClientX, curClientY);
	
				const newX = curMouseWorld.x + grabOffsetX;
				const newY = curMouseWorld.y + grabOffsetY;
	
				if (startFromOutput) {
					conn.positions.endX = newX;
					conn.positions.endY = newY;
				} else {
					conn.positions.startX = newX;
					conn.positions.startY = newY;
				}
			},
			() => {}
		);
	}
	

}
