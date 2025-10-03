/*
	ClampValueNode.js
	-----------------

	This will be a node that provides some basic math operations, in the form of A - B, A + B, A * B, A / B, etc.
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
export default class ClampValueNode extends NWNode {

	// static properties for the class
	static nodeName = 'Clamp';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'value',
			title: 'Value to Clamp', 
			description: "The value to clamp",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'minValue',
			title: 'Min Value', 
			description: "Minimum to clamp to",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'maxValue',
			title: 'Max Value', 
			description: "Maximum to clamp to",
			type: VNumber,
		});	
	
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Clamped Value', 
			description: "Clamped value",
			type: VNumber,
		});

	}
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	
		this.fieldState.maxValue.val = 1;
	}

}
