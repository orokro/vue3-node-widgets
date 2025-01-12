/*
	NodeWidget.js
	-------------

	This file provides the base class for all the different kinds of nodes that can be added to the NodeWidget editor.

	Each node class must extend this class and implement the necessary methods to define it's behavior.

	Developers can create their own node classes by extending this class and implementing the necessary methods.

	Instances of this class provide state for the Vue3 components, and can also (de)serialize themselves to/from JSON.
*/

// vue
import { ref } from 'vue';

// main export class
export default class NodeWidget {

	// static properties for the class
	static nodeName = 'NodeWidget';
	static icon = null;

	/**
	 * Constructor
	 */
	constructor(){

	}

}
