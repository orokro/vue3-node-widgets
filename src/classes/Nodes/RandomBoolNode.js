/*
	RandomBoolNode.js
	-----------------

	Picks random Boolean
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
export default class RandomBoolNode extends NWNode {

	// static properties for the class
	static nodeName = 'Random Boolean';
	static icon = 'random-color';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Random Boolean Result', 
			description: "Random Boolean result, either true or false",
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
