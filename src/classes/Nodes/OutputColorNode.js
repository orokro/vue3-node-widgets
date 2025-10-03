/*
	OutputColorNode.js
	------------------

	So this node is a bit more specific than others.
	Part of this project will be to provide a demo for rendering graphics on a canvas.
	I will be recreating a project from 2014.

	This will eventually allow the user to pick an image to sample colors from.
*/

import NWNode from '../NWNode.js';
import { NODE_TYPE, FIELD_TYPE } from '../NWNode.js';
import { 
	VAngle,
	VAngles,
	VBoolean,
	VCharacter,
	VColor3,
	VColor4,
	VInteger,
	VNumber,
	VText,
	VVector2,
	VVector3,
	VEnum,
 } from '../Types/index.js';
 
// main export
export default class OutputColor extends NWNode {

	// static properties for the class
	static nodeName = 'Output Color';
	static icon = 'output';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.OUTPUT);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'outColor',
			title: 'Output Color',
			description: "The color to output to the canvas",
			type: VColor3
		});
	}
	

	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
