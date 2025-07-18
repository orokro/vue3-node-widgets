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

	// static properties for the class
	static nodeName = 'unnamed node';
	static icon = null;

	/**
	 * Constructor
	 */
	constructor(){

	}

}
