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

// vue
import { shallowRef, ref } from "vue";

// app
import { Connection } from "./Connection";
import NWNode, { SOCKET_TYPE } from "./NWNode";

// main export
export class ConnectionManager {

	/**
	 * Constructs a new ConnectionManager instance.
	 * 
	 * @param {NWGraph} graph - the NWGraph instance that this ConnectionManager will be associated with.
	 */
	constructor(graph) {

		// save the graph we're for
		this.graph = graph;

		// the wires array
		this.wires = this.graph.wires;

		// while the user is dragging out a wire, we'll store some state here
		this.draggingWire = shallowRef(false);
		this.dragEnd = shallowRef(SOCKET_TYPE.OUTPUT);
		this.dragOriginNode = shallowRef(null);
		this.dragOriginField = shallowRef(null);
		this.dragCurrentPos = shallowRef({ x: 0, y: 0 });
		this.isSnappedToSocket = shallowRef(false);
		this.connectionBeingDragged = null;

		// we'll keep a cache of the map for quick lookups
		// cached adjacency: Map<NWNode, Set<NWNode>>; FROM (output node) -> TO (input node)
		this._adjCache = null;
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

		// invalidate the graph cache & tick the version
		this._invalidateGraphCache();

		// tell nodes in the connection to tick their wire versions
		conn.getNodeWireTickFn()();

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

		// invalidate the graph cache & tick the version
		this._invalidateGraphCache();

		// tell nodes in the connection to tick their wire versions
		conn.getNodeWireTickFn()();
	}


	/**
	 * Breaks all connections that involve a specific node or array of nodes.
	 * 
	 * @param {NWNode|NWNode[]} node - the node or array of nodes to break connections for.
	 * @returns {void}
	 */
	breakConnectionsByNode(node) {

		// convert node to array if it's not
		if (!Array.isArray(node))
			node = [node];

		// loop through all the wires and break any connections that involve the node
		for (const conn of this.wires.value) {

			// if the connection has the node as an input or output, break it
			if (node.includes(conn.inputNode) || node.includes(conn.outputNode))
				conn.destroy();
		}
	}


	/**
	 * When a node is moved, we should update the x/y positions of any wires connected to it.
	 * 
	 * @param {NWNode|NWNode[]} node 
	 */
	moveWires(node) {

		// convert to array if not already
		if (!Array.isArray(node))
			node = [node];

		// filter out all the connections that wire into this node
		this.wires.value.map(conn => {
			if (node.includes(conn.inputNode))
				conn.updatePositions(SOCKET_TYPE.INPUT);
			if (node.includes(conn.outputNode))
				conn.updatePositions(SOCKET_TYPE.OUTPUT);
			return conn;
		});
	}


	/**
	 * Starts dragging a wire from a node's socket.
	 * 
	 * @param {Object} ctx - context about the component (if needed).
	 * @param {NWNode} node - the node that the wire is being started from.
	 * @param {Object} field - the field on the node that the wire is being started from.
	 * @param {Boolean} startFromOutput - whether the wire is being started from an output socket (true) or an input socket (false).
	 * @param {MouseEvent} event - the mouse event that triggered the wire start (if applicable).
	 * @returns {void}
	 */
	startWire(ctx, node, field, startFromOutput = true, event) {

		// save our stats about our drag origin
		// note on this: users can drag from an output socket or an input socket
		// so we need to note which end of the wire is attached to the mouse
		this.dragEnd.value = startFromOutput ? SOCKET_TYPE.OUTPUT : SOCKET_TYPE.INPUT;
		this.dragOriginNode.value = node;
		this.dragOriginField.value = field;
		this.isSnappedToSocket.value = false;

		// the connection that we're dragging
		let conn = null;
		let oldConn = false;
		let oldOffset = { x: 0, y: 0 };

		// if we're starting from an input socket, we need to check if a connection is already plugged in there
		// because only one connection can go into an input, we'll detach it instead
		if (startFromOutput === false) {

			// check for any connections already plugged into this input socket
			const existingConnections = this.getConnectionsBySocket(node, field, true);

			if (existingConnections.length > 0) {

				const existingConn = existingConnections[0];
				conn = existingConn;
				node = existingConn.inputNode;
				field = existingConn.inputField;

				// tell nodes in the connection to tick their wire versions	
				conn.getNodeWireTickFn()();

				// clear it's output b/c we're moving it
				this.dragOriginNode.value = node;
				this.dragOriginField.value = field;
				this.dragEnd.value = SOCKET_TYPE.OUTPUT;
				conn.setOutput(null, null);

				startFromOutput = true;
				oldConn = true;
				oldOffset = {
					x: existingConn.positions.endX - existingConn.positions.startX,
					y: existingConn.positions.endY - existingConn.positions.startY
				};

			} else {

				// add a new connection, we'll fill in the positions later
				conn = this.addConnectionBasic();
			}

		} else {

			// add a new connection, we'll fill in the positions later
			conn = this.addConnectionBasic();
		}

		// save on our state
		this.connectionBeingDragged = conn;

		// we'll store the initial scale of zoom when drag was started incase someone zoom-scrolls while dragging
		const startScale = ctx.viewport.zoomScale.value;

		// set the start & node the positions
		let startX = 0;
		let startY = 0;
		if (startFromOutput) {

			// the INPUT for the wire is an output socket
			conn.setInput(node, field);
			startX = conn.positions.endX = conn.positions.startX + oldOffset.x;
			startY = conn.positions.endY = conn.positions.startY + oldOffset.y;

		} else {
			// the OUTPUT for the wire is an input socket
			conn.setOutput(node, field);
			startX = conn.positions.startX = conn.positions.endX;
			startY = conn.positions.startY = conn.positions.endY;
		}


		//	shift start to the *click point* (center -> click delta in world units)
		const offset = this.socketClickWorldOffset(ctx, event, startScale);
		startX += offset.x;
		startY += offset.y;

		// true while dragging
		this.draggingWire.value = true;

		// do the drag
		this.attachWireDrag(ctx, conn, startFromOutput, startX, startY, event);

		return conn;
	}


	/**
	 * Get's all connections for a specific socket on a node.
	 * 
	 * @param {NWNode} node - the node to get connections for.
	 * @param {Object} field - the field on the node to get connections for.
	 * @param {Boolean} isInputSocket - true if looking for input sockets
	 * @returns 
	 */
	getConnectionsBySocket(node, field, isInputSocket = true) {

		// if the node is not an instance of NWNode, we can't do anything
		if (!(node instanceof NWNode)) return [];

		// if the field is not defined, we can't do anything
		if (!field || !field.name) return [];

		// filter the wires for connections that match the node and field
		return this.wires.value.filter(conn => {

			if (isInputSocket) {
				return conn.outputNode === node && conn.outputField.name === field.name;
			} else {
				return conn.inputNode === node && conn.inputField.name === field.name;
			}
		});
	}



	/**
	 * When the user hovers over a socket, we might wanna snap to it if we're in the middle of dragging a wire.
	 * 
	 * @param {Object} ctx - context about the component (if needed).
	 * @param {NWNode} node - the node that the socket belongs to.
	 * @param {Object} field - the field on the node that the socket belongs to.
	 * @param {Boolean} isInputSocket - whether the socket is an input socket (true) or an output socket (false).
	 * @param {CursorPopup} cursorPopup - optional cursor popup instance to show info about the socket.
	 * @returns {void}
	 */
	hoverSocket(ctx, node, field, isInputSocket = true, cursorPopup = null) {

		// if we're not dragging a wire, just GTFO
		if (!this.draggingWire.value) return;

		// if we're dragging the wire from an output socket, then we need to snap to the input socket
		if (this.dragEnd.value === SOCKET_TYPE.OUTPUT && !isInputSocket) return;

		// if we're dragging the wire from an input socket, then we need to snap to the output socket
		if (this.dragEnd.value === SOCKET_TYPE.INPUT && isInputSocket) return;

		// for now we'll just show the socket name,
		// later we'll show conversion or other info
		// cursorPopup.show(`${node.slug}_${field.name}`);

		// loop check: bail if this snap would create a cycle
		if (this._wouldCreateLoopForHover(node, isInputSocket)) {

			cursorPopup.show('Loops not allowed');
			return;
		}

		// figure out the types for compatibility checks
		// note: depending on which end we're dragging, the "from" side flips
		let fromType = null;
		let toType = null;

		if (isInputSocket) {

			// dragging from an OUTPUT → hovering an INPUT
			fromType = this.connectionBeingDragged?.inputField?.valueType || null;
			toType = field?.valueType || null;

		} else {

			// dragging from an INPUT → hovering an OUTPUT
			fromType = field?.valueType || null;
			toType = this.connectionBeingDragged?.outputField?.valueType || null;

		}

		// if we don't have types for some reason, just show the name and bail
		if (!fromType || !toType) {

			cursorPopup.show(`${node.slug}_${field.name}`);
			return;
		}

		// same type → no conversion
		if (fromType.typeName === toType.typeName) {

			// cursorPopup.show(`${node.slug}_${field.name} (${toType})`);
			cursorPopup.show(`Same Type: ${fromType.typeName}`);

		} else {

			const willCoalesce = ctx.editor.typeRegistry.willCoalesce(fromType, toType);

			// different type → see if we can coalesce FROM → TO
			if (willCoalesce != false) {

				// willCoalesce will be an array of types, generate the string
				const coalescePath = willCoalesce.map(t => t.typeName).join(' → ');

				// show msg
				cursorPopup.show(`Will Convert: \n${coalescePath}`);
			}

			// incompatible → show error + exit early (do NOT snap)
			else {

				cursorPopup.show(`Incompatible: ${fromType.typeName} → ${toType.typeName}`);
				return;	// don't snap
			}
		}

		// if we're here, then we need to snap to the socket
		if (isInputSocket) {

			// set the input for the connection
			this.connectionBeingDragged.setOutput(node, field);
			this.isSnappedToSocket.value = true;
		} else {

			// set the output for the connection
			this.connectionBeingDragged.setInput(node, field);
			this.isSnappedToSocket.value = true;
		}
	}


	/**
	 * When the user stops hovering over a socket, we need to detach the drag end.
	 * 
	 * @param {Object} ctx - context about the component (if needed).
	 */
	leaveSocket(ctx) {

		// gtfo if we're not in the middle of dragging a wire
		if (!this.draggingWire.value) return;

		// detach the drag end
		if (this.dragEnd.value === SOCKET_TYPE.OUTPUT) {
			this.connectionBeingDragged.setOutput(null, null);
		} else {
			this.connectionBeingDragged.setInput(null, null);
		}

		this.isSnappedToSocket.value = false;
	}


	/**
	 * Helper to convert screen coordinates to world coordinates.
	 * 
	 * @param {Object} ctx - context about the component (if needed).
	 * @param {Number} clientX - the X position of the mouse in screen coordinates.
	 * @param {Number} clientY - the Y position of the mouse in screen coordinates.
	 * @returns {Object} - an object with the world coordinates of the mouse position, adjusted for the current pan and zoom.
	 */
	screenToWorld(ctx, clientX, clientY) {

		const scale = ctx.viewport.zoomScale.value;
		const panX = ctx.viewport.panX.value;
		const panY = ctx.viewport.panY.value;
		return {
			x: (clientX - panX) / scale,
			y: (clientY - panY) / scale
		};
	}


	/**
	 * Does the drag-logic for a new wire connection.
	 * 
	 * @param {Object} ctx - context about the component (if needed).
	 * @param {Connection} conn - the connection to attach the drag handler to.
	 * @param {Boolean} startFromOutput - whether the wire is being started from an output socket (true) or an input socket (false).
	 * @param {Number} startX - the X position to start dragging from.
	 * @param {Number} startY - the Y position to start dragging from.	
	 * @param {MouseEvent} startEvent - the mouse event that triggered the wire start (if applicable).
	 */
	attachWireDrag(ctx, conn, startFromOutput, startX, startY, startEvent) {

		//	mouse screen position at drag start
		const startClientX = startEvent?.clientX ?? 0;
		const startClientY = startEvent?.clientY ?? 0;

		//	mouse world position at drag start
		const startMouseWorld = this.screenToWorld(ctx, startClientX, startClientY);

		//	world pos of the grabbed end at drag start
		const startWorldX = startX;
		const startWorldY = startY;

		//	fixed offset so the grabbed point stays under the cursor
		const grabOffsetX = startWorldX - startMouseWorld.x;
		const grabOffsetY = startWorldY - startMouseWorld.y;

		ctx.dh.dragStart(
			(dx, dy) => {

				// gtfo if we're snapped
				if (this.isSnappedToSocket.value) return;

				//	reconstruct current mouse screen pos from cumulative deltas
				const curClientX = startClientX - dx;
				const curClientY = startClientY - dy;

				//	project through the *current* view (handles mid-drag zoom/pan)
				const curMouseWorld = this.screenToWorld(ctx, curClientX, curClientY);

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
			() => {

				// clear our drag state
				this.draggingWire.value = false;
				this.connectionBeingDragged = null;
				this.isSnappedToSocket.value = false;

				// if the wire doesn't have both an input and output, we need to destroy it
				if (!conn.inputNode || !conn.outputNode) {
					conn.destroy();
					conn.getNodeWireTickFn()();
					return;
				}

				// if the wire was dragged into an input socket, it should replace whatever was there
				if (startFromOutput == true) {

					// get all the connections for the input socket
					const existingConnections = this.getConnectionsBySocket(conn.outputNode, conn.outputField, true);

					// filter out this new one online
					const otherConnections = existingConnections.filter(c => c.id !== conn.id);

					// destroy other connections
					for (const otherConn of otherConnections)
						otherConn.destroy();
				}

				conn.getNodeWireTickFn()();

			}
		);
	}


	/**
	 * Helper to adjust wire drag pos based where the cursor clicked the origin socket
	 * 
	 * @param {Object} ctx - context about the component (if needed).
	 * @param {MouseEvent} evt - the mouse event that triggered the click.
	 * @param {Number} scale - the zoom scale to use for the conversion. Defaults to the current zoom scale.
	 * @returns {Object} - an object with the x and y offsets in world units from the center of the socket to the click position.
	 */
	socketClickWorldOffset(ctx, evt, scale) {
		
		const el = evt.currentTarget || evt.target;
		if (!el || !el.getBoundingClientRect) return { x: 0, y: 0 };

		scale = scale || ctx.viewport.zoomScale.value;

		const rect = el.getBoundingClientRect();
		const centerClientX = rect.left + rect.width * 0.5;
		const centerClientY = rect.top + rect.height * 0.5;

		//	screen delta from center -> click
		const dxScreen = evt.clientX - centerClientX;
		const dyScreen = evt.clientY - centerClientY;

		//	convert to world units; pan cancels for deltas, only divide by scale
		return {
			x: dxScreen / scale,
			y: dyScreen / scale
		};
	}


	/**
	 * Blow away the cached graph. Call this anytime a connection structure changes.
	 */
	_invalidateGraphCache() {
		this._adjCache = null;
	}


	/**
	 * Build the adjacency map from the current wires list (only fully attached wires).
	 * 
	 * @returns {Map<NWNode, Set<NWNode>>} - the adjacency map representing the graph.
	 */
	_buildGraphCache() {

		// return the cached version if we have it
		if (this._adjCache)
			return this._adjCache;

		/** @type {Map<NWNode, Set<NWNode>>} */
		const adj = new Map();

		for (const conn of this.wires.value) {

			// skip partial wires while dragging
			const producer = conn?.inputNode || null;	// upstream
			const consumer = conn?.outputNode || null;	// downstream
			if (!producer || !consumer) continue;

			// get or create a set for this source (producer) Node
			let set = adj.get(producer);
			if (!set) {
				set = new Set();
				adj.set(producer, set);
			}

			// add the downstream (consumer) Node to the set
			set.add(consumer);

		}// next conn

		// now a this point, adj should be a map of nodes, and their sets of downstream nodes
		// save our cache & return it
		this._adjCache = adj;
		return adj;

	}// next conn


	/**
	 * Returns true if adding an edge FROM -> TO would close a cycle.
	 * FROM is the node whose OUTPUT socket is the source.
	 * TO is the node whose INPUT socket is the target.
	 * 
	 * @param {NWNode} fromNode - the node that would be the source of the edge.
	 * @param {NWNode} toNode - the node that would be the target of the edge.
	 * @returns {Boolean} - true if adding the edge would create a cycle.
	 */
	_wouldCreateLoop(fromNode, toNode) {

		// gtfo if either node is null
		if (!fromNode || !toNode)
			return false;

		// trivial self-edge
		if (fromNode === toNode)
			return true;

		// get our build graph cache
		const adj = this._buildGraphCache();

		// adding fromNode -> toNode is a cycle if toNode can already reach fromNode
		const stack = [toNode];
		const visited = new Set();

		/*
			depth-first search

			So basically, we'll start with the node we're trying to connect TO (the consumer).

			We'll walk all of it's downstream connections, then all of their downstream connections, etc.
			recursively until we either find the node we're trying to connect FROM (the producer),
			or we run out of nodes to walk.

			If we the node we're connection FROM is found, then there's already a path to it,
			we found a loop and we can return true. (_wouldCreateLoop = true)

			If we run out of nodes to walk, then there's no path to it, and we can return false.
		*/
		while (stack.length) {

			// our stack is a list of nodes to check, get the last one
			const n = stack.pop();

			// if we found fromNode, then there's a path to it
			if (n === fromNode)
				return true;

			// if we've already processed this node (i.e. walked its downstream edges), skip it
			if (visited.has(n))
				continue;

			// note we've seen this one
			visited.add(n);

			// from our map, get all the downstream nodes
			const next = adj.get(n);
			if (!next)
				continue;

			// loop over the downstream nodes, add them to the stack if we haven't seen them yet
			for (const ds of next) {
				if (!visited.has(ds))
					stack.push(ds);
			}// next ds

		}// wend

		return false;
	}
	

	/**
	 * Helper for hoverSocket(): tell me if snapping here would create a loop.
	 * - Hovering an INPUT	 → from = fixed "input end" (attaches to an OUTPUT socket)
	 * - Hovering an OUTPUT → from = hovered node (its OUTPUT), to = fixed "output end"
	 * 
	 * @param {NWNode} node - the node being hovered
	 * @param {Boolean} isInputSocket - true if hovering an input socket
	 * @returns {Boolean} - true if snapping here would create a loop
	 */
	_wouldCreateLoopForHover(node, isInputSocket) {

		let fromNode = null;
		let toNode = null;

		if (isInputSocket) {

			// hovering an INPUT; we started drag from an OUTPUT
			// edge would be: connection.inputNode (producer) -> hovered node (consumer)
			fromNode = this.connectionBeingDragged?.inputNode || null;
			toNode = node || null;

		} else {
			// hovering an OUTPUT; we started drag from an INPUT
			// edge would be: hovered node (producer) -> connection.outputNode (consumer)
			fromNode = node || null;
			toNode = this.connectionBeingDragged?.outputNode || null;
		}

		// now that we have both ends, we can check if there's a loop
		return this._wouldCreateLoop(fromNode, toNode);
	}

}
