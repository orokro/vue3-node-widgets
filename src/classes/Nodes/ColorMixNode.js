/*
	ColorMixNode.js
	---------------

	This will be a node that provides a color mixing interface, allowing users to blend two or more colors.
*/

import NWNode from '../NWNode.js';

// main export
export default class ColorMixNode extends NWNode {

	// static properties for the class
	static nodeName = 'Color Mix Node';
	static icon = 'color-mix';

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
