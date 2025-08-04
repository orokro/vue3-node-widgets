/*
	RandomV2Node.js
	---------------

	Picks a random Vector2 within a specified range.
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
export default class RandomV2Node extends NWNode {

	// static properties for the class
	static nodeName = 'Random Vector2';
	static icon = 'random-color';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'v2Min',
			title: 'Minimum Vector2',
			description: "Minimum Vector2 values for random generation, in a Vector 2 format", 
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.INPUT, {
			name: 'v2Max',
			title: 'Maximum Vector2',
			description: "Maximum Vector2 values for random generation, in a Vector 2 format", 
			type: VVector2,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Random Vector2 Result', 
			description: "Random Vector2 result within the specified min and max range",
			type: VVector2,
		});
	}

	/**
	 * Constructor
	 */
	constructor() {
		super();

		this.fieldState.v2Min.val = {x: 0, y: 0};
		this.fieldState.v2Max.val = {x: 1, y: 1};
	}

}
