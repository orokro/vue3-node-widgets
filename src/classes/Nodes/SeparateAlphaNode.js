/*
	SeparateAlpha.js
	----------------

	Gets the alpha channel of a color
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
export default class SeparateAlpha extends NWNode {

	// static properties for the class
	static nodeName = 'Separate Alpha';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'col',
			title: 'Input Color', 
			description: "Color to get the alpha channel from",
			type: VColor4,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'a',
			title: 'Alpha', 
			description: "Alpha channel of the color",
			type: VNumber,
		});

	}
	
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
