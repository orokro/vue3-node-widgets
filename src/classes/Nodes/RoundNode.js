/*
	RoundNode.js
	------------

	This node will provide round, floor, or ceil operations on a number.
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
export default class RoundNode extends NWNode {

	// static properties for the class
	static nodeName = 'Round';
	static icon = 'round';

	static {
	
		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'aValue',
			title: 'Value', 
			description: "The value to round, floor, or ceil",
			type: VNumber,
		});	
	
		// enumeration
		this.addField(FIELD_TYPE.PROP, { 
			name: 'operation',
			title: 'Operation',
			description: "Which Round operation to perform (round, floor, ceil)",
			type: VEnum.With(['Round', 'Floor', 'Ceil']),
		});

		this.addField(FIELD_TYPE.PROP, { 
			name: 'places',
			title: 'Places', 
			description: "Number of decimal places to round to",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Rounded Value', 
			description: "Result of rounding operation",
			type: VNumber,
		});

	}

	/**
	 * Constructor
	 */
	constructor() {
		super();

		this.fieldState.places.val = 1;
	}

}
