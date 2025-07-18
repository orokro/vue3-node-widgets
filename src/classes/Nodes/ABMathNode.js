/*
	ABMathNode.js
	-------------

	This will be a node that provides some basic math operations, in the form of A - B, A + B, A * B, A / B, etc.
*/

import NWNode from '../NWNode.js';

// main export
export default class ABMathNode extends NWNode {

	// static properties for the class
	static nodeName = 'AB Math Node';
	static icon = 'math';

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
