/*
	Connection.js
	-------------

	This will store the details of a connection between two nodes,
	in our connection manager.
*/

import { reactive, ref } from "vue";
import { ConnectionManager } from "./ConnectionManager";
import NWNode, { SOCKET_TYPE } from "./NWNode";

export class Connection {

	/**
	 * Constructs a new Connection instance.
	 * 
	 * @param {ConnectionManager} mgr The connection manager that this connection belongs to.
	 */
	constructor(mgr){

		// generate unique ID
		this.id = 'wire_' + Math.random().toString(16).slice(2);

		// the connection manager
		this.mgr = mgr;

		// while we could derive the position data from the node & socket positions,
		// that would require some cpu work to calculate the positions.
		// instead we'll store the positions (which is used for the rendering of components)
		// in this reactive object & just update it when nodes are moved or sockets are changed.
		this.positions = reactive({

			// for bezier, the start and end points
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0,
		});

		/*
			NOTE:
			naming convention might change later, but this may be counter intuitive:
			the input of the wire attaches to the output socket of a node.

			So inputNode/inputField refers to the node & field that is the output,
			where as outputNode/outputField refers to the node & field that is the input.
		*/

		// save the input node & field
		this.inputNode = null;
		this.inputField = null;

		// save the output node & field
		this.outputNode = null;
		this.outputField = null;

		// true if being destroyed
		this.isBeingDestroyed = ref(false);
	}


	/**
	 * Sets the input for this connection.
	 * 
	 * @param {NWNode} node - the node that is the input for this connection.
	 * @param {Object} field - the field on the node that is the input for this connection.
	 */
	setInput(node, field){

		// null defaults
		node = node || null;
		field = field || null;

		// save the input node & field
		this.inputNode = node;
		this.inputField = field;

		// if it was nulled (cleared) then we can just GTFO now
		if(node === null || field === null)
			return;
		
		// update the start position
		const socketPos = node.getSocketPosition(field, SOCKET_TYPE.OUTPUT);
		this.positions.startX = socketPos.x;
		this.positions.startY = socketPos.y;
	}


	/**
	 * Sets the output for this connection.
	 * 
	 * @param {NWNode} node - the node that is the output for this connection.
	 * @param {Object} field - the field on the node that is the output for this connection.
	 */
	setOutput(node, field){

		// null defaults
		node = node || null;
		field = field || null;

		// save the output node & field
		this.outputNode = node;
		this.outputField = field;

		// if it was nulled (cleared) then we can just GTFO now
		if(node === null || field === null)
			return;

		// update the end position
		const socketPos = node.getSocketPosition(field, SOCKET_TYPE.INPUT);
		this.positions.endX = socketPos.x;
		this.positions.endY = socketPos.y;
	}


	/**
	 * Updates the positions of the connection's start and end points.
	 */
	updatePositions(which = 'both'){

		if(which === SOCKET_TYPE.INPUT || which === 'both'){
			if(this.inputNode && this.inputField){
				const socketPos = this.inputNode.getSocketPosition(this.inputField, SOCKET_TYPE.OUTPUT);
				this.positions.startX = socketPos.x;
				this.positions.startY = socketPos.y;
			}
		}
		if(which === SOCKET_TYPE.OUTPUT || which === 'both'){
			if(this.outputNode && this.outputField){
				const socketPos = this.outputNode.getSocketPosition(this.outputField, SOCKET_TYPE.INPUT);
				this.positions.endX = socketPos.x;
				this.positions.endY = socketPos.y;
			}
		}
	}


	/**
	 * Destroys this connection.
	 * 
	 * This will remove the connection from the connection manager
	 * and clean up any resources associated with it.
	 */
	destroy(){

		// set destroying to true to fade it out & then kill self
		this.isBeingDestroyed.value = true;

		// clear input and output refs
		this.setInput(null, null);
		this.setOutput(null, null);

		// wait ab it & kill self
		setTimeout(() => {

			// am kil
			this.mgr.destroyConnection(this.id);
		}, 210);
	}

}
