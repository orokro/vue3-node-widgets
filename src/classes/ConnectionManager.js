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

		// this wire will be used for for the wire being drawn
		// or debugging
		this.tempWire = new Connection(this);

	}


	addConnectionBasic(startX, startY, endX, endY) {

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


}
