/*
	RoundNode.js
	------------

	This node will provide round, floor, or ceil operations on a number.
*/

import NWNode from '../NWNode.js';

// main export
export default class RoundNode extends NWNode {

	// static properties for the class
	static nodeName = 'Round Node';
	static icon = 'round';

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
