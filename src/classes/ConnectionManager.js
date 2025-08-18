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
import { SOCKET_TYPE } from "./NWNode";

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


	startWire(node, field, startFromOutput = true) {

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

		if( startFromOutput ) {
			
			// the INPUT for the wire is an output socket
			conn.setInput(node, field);
		}else {
			// the OUTPUT for the wire is an input socket
			conn.setOutput(node, field);
		}

		return conn;
	}


}
