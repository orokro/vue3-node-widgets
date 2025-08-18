/*
	Connection.js
	-------------

	This will store the details of a connection between two nodes,
	in our connection manager.
*/

import { reactive } from "vue";
import { ConnectionManager } from "./ConnectionManager";
import { SOCKET_TYPE } from "./NWNode";

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
	}


	setInput(node, field){

		// save the input node & field
		this.inputNode = node;
		this.inputField = field;

		// update the start position
		const socketPos = node.getSocketPosition(field, SOCKET_TYPE.OUTPUT);
		this.positions.startX = socketPos.x;
		this.positions.startY = socketPos.y;
	}


	setOutput(node, field){

		// save the output node & field
		this.outputNode = node;
		this.outputField = field;

		// update the end position
		const socketPos = node.getSocketPosition(field, SOCKET_TYPE.INPUT);
		this.positions.endX = socketPos.x;
		this.positions.endY = socketPos.y;
	}


	/**
	 * Destroys this connection.
	 * 
	 * This will remove the connection from the connection manager
	 * and clean up any resources associated with it.
	 */
	destroy(){

		// am kil
		this.mgr.destroyConnection(this.id);
	}

}
