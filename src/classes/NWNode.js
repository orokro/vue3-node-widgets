/*
	NWNode.js
	---------

	This file provides the base class for all the different kinds of nodes that can be added to the NodeWidget editor.

	NOTE: we use NW prefix for the node widget system.
	So, this is "NWNode" or "Node Widget Node", lol.
	Each node class must extend this class and implement the necessary methods to define it's behavior.

	Developers can create their own node classes by extending this class and implementing the necessary methods.

	Instances of this class provide state for the Vue3 components, and can also (de)serialize themselves to/from JSON.

	The system will provide a menu to add nodes to the scene. Therefore, 
*/

// vue
import { ref } from 'vue';

// main export class
export default class NWNode {

	// id counter for nodes
	static idCounter = 0;

	// static properties for the class
	static nodeName = 'unnamed node';
	static icon = null;

	// unique id for this node
	id = `node_${++NWNode.idCounter}`;

	// position of the node in the graph
	x = ref(0);
	y = ref(0);

	/**
	 * Constructor
	 */
	constructor(){

	}


	/**
	 * Sets the position of the node	
	 * @param {Number} x - horizontal position 
	 * @param {Number} y - vertical position
	 */
	setPosition(x, y) {

		// snap to units of 10
		x = Math.round(x / 10) * 10;
		y = Math.round(y / 10) * 10;

		// set the position of the node
		this.x.value = x;
		this.y.value = y;
	}

}
