/*
	RandomNumberNode.js
	-------------------

	This will be a node that provides a random number within a specified range.
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
export default class RandomNumberNode extends NWNode {

	// static properties for the class
	static nodeName = 'Random Number';
	static icon = 'random-number';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'minVale',
			title: 'Min Value', 
			description: "Minimum value for the random number",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, {
			name: 'maxValue',
			title: 'Max Value', 
			description: "Maximum value for the random number",
			type: VNumber,
		});


		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Random Number', 
			description: "Random number within the specified range",
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
