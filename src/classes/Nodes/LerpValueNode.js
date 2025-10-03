/*
	LerpValueNode.js
	----------------

	Node to lerp A and B values based on a factor.
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
export default class LerpValueNode extends NWNode {

	// static properties for the class
	static nodeName = 'Lerp Value';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'aValue',
			title: 'A Value', 
			description: "A value for math operations",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'bValue',
			title: 'B Value', 
			description: "B value for math operations",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'tValue',
			title: 'T Value', 
			description: "T value for lerping between A and B",
			type: VNumber,
		});	
	
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Result', 
			description: "Result of Lerp operation",
			type: VNumber,
		});

	}
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);

		this.fieldState.bValue.val = 1;
	}

}
