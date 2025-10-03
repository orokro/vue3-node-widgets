/*
	V2CombineXYNode.js
	------------------

	Joins the X and Y components of a Vector2 into a single vector.
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
export default class V2CombineXYNode extends NWNode {

	// static properties for the class
	static nodeName = 'Combine XY';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'x',
			title: 'X', 
			description: "X component of the vector",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'y',
			title: 'Y', 
			description: "Y component of the vector",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'vecA',
			title: 'Output Vector', 
			description: "Vector created from X and Y components",
			type: VVector2,
		});	

	}
	
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
