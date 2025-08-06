/*
	TexCheckerNode.js
	-----------------

	So this node is a bit more specific than others.
	Part of this project will be to provide a demo for rendering graphics on a canvas.
	I will be recreating a project from 2014.

	This will generate a checkerboard pattern texture for painting
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
export default class TexChecker extends NWNode {

	// static properties for the class
	static nodeName = 'Checker Pattern';
	static icon = 'texture';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'sizeV2',
			title: 'Checker cell Width x Height as Vector2', 
			description: "X is width, Y is height",
			type: VVector2,
		});	
	
		this.addField(FIELD_TYPE.INPUT, { 
			name: 'colorA',
			title: 'Color A',
			description: "The first color to fill the checkers with",
			type: VColor3
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'colorB',
			title: 'Color B',
			description: "The second color to fill the checkers with",
			type: VColor3
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
