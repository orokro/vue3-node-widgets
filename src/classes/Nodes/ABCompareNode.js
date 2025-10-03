/*
	ABCompareNode.js
	----------------

	Provides logic for comparing A to B, i.e =, !=, <, >, <=, >=

	outputs a Boolean value
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
export default class ABCompareNode extends NWNode {

	// static properties for the class
	static nodeName = 'AB Compare';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'aValue',
			title: 'A Value', 
			description: "A value to compare to B",
			type: VNumber,
		});	
	
		// enumeration
		this.addField(FIELD_TYPE.PROP, { 
			name: 'operation',
			title: 'Operation',
			description: "Which comparison operation to perform",
			type: VEnum.With([
					'= (Equals)', 
					'!= (Not Equals)', 
					'< (Less Than)',
					'> (Greater Than)', 
					'<= (Less Than or Equal)',
					'>= (Greater Than or Equal)'
			]),
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'bValue',
			title: 'B Value', 
			description: "B value to compare to A",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Result', 
			description: "Result of comparison",
			type: VBoolean,
		});

	}
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
