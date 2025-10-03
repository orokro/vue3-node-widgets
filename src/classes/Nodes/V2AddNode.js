/*
	V2AddNode.js
	------------

	Adds 2 Vector2s
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
export default class V2AddNode extends NWNode {

	// static properties for the class
	static nodeName = 'V2 Addition';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecA',
			title: 'Vector A', 
			description: "Vector to add to",
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecB',
			title: 'Vector B', 
			description: "Vector to add",
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Added Vector', 
			description: "Added Vector",
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
