/*
	RandomColorNode.js
	------------------

	This will be a node that provides a random color within a specified range.
*/

import NWNode from '../NWNode.js';

// main export
export default class RandomColorNode extends NWNode {

	// static properties for the class
	static nodeName = 'Random Color Node';
	static icon = 'random-color';

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
