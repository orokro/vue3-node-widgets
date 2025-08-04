/*
	ColorPickerNode.js
	------------------

	This will be a node that provides a color picker interface, 
	and provide color, RGBA, or hex values as output.
*/

import NWNode from '../NWNode.js';

// main export
export default class ColorPickerNode extends NWNode {

	// static properties for the class
	static nodeName = 'Color Picker';
	static icon = 'color-picker';

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
