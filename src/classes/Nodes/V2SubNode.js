/*
	V2SubNode.js
	------------

	Subtracts a Vector 2 from another Vector 2
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
export default class V2SubNode extends NWNode {

	// static properties for the class
	static nodeName = 'V2 Subtraction';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecA',
			title: 'Vector A', 
			description: "Vector to subtract from",
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecB',
			title: 'Vector B', 
			description: "Vector to subtract",
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Difference Vector', 
			description: "Difference Vector",
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
