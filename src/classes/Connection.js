/*
	Connection.js
	-------------

	This will store the details of a connection between two nodes,
	in our connection manager.
*/

import { reactive } from "vue";
import { ConnectionManager } from "./ConnectionManager";

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
	}

}
