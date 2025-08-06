/*
	TexImageNode.js
	---------------

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
export default class TexImage extends NWNode {

	// static properties for the class
	static nodeName = 'Image Texture';
	static icon = 'texture';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		// in the future this will be a custom component reading actual images
		// but for now we'll just use an index from some image list
		this.addField(FIELD_TYPE.INPUT, { 
			name: 'imageIndex',
			title: 'Image Index', 
			description: "Image Index",
			type: VInteger,
		});	
		
		this.addField(FIELD_TYPE.INPUT, {
			name: 'posV2',
			title: 'Pixel X, Y as Vector2', 
			description: "Pixel X and Y as Vector2",
			type: VVector2,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'outColor',
			title: 'Output Color',
			description: "The output color based on the checker pattern",
			type: VColor3
		});
	}
	

	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
