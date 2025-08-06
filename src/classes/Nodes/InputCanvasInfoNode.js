/*
	InputCanvasInfoNode.js
	----------------------

	So this node is a bit more specific than others.
	Part of this project will be to provide a demo for rendering graphics on a canvas.
	I will be recreating a project from 2014.

	Specifically, this node will provide info about the canvas that is rendering.
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
export default class InputCanvasInfo extends NWNode {

	// static properties for the class
	static nodeName = 'Canvas Info';
	static icon = 'input';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.INPUT);

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'sizeV2',
			title: 'Width x Height as Vector2', 
			description: "X is width, Y is height",
			type: VVector2,
		});	
	
		this.addField(FIELD_TYPE.PROP, { 
			name: 'width',
			title: 'Width',
			description: "Width",
			type: VInteger
		});

		this.addField(FIELD_TYPE.PROP, { 
			name: 'height',
			title: 'Height',
			description: "Height",
			type: VInteger
		});
	}
	

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
