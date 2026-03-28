/*
	V3AddNode.js
	------------

	Adds 3 Vector3s
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
export default class V3AddNode extends NWNode {

	// static properties for the class
	static nodeName = 'V3 Addition';
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
			type: VVector3,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecB',
			title: 'Vector B', 
			description: "Vector to add",
			type: VVector3,
		});	

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'result',
			title: 'Added Vector',
			description: "Added Vector",
			type: VVector3,
		});

		this.setEvalFunction((inputs) => {
			const a = inputs.vecA || { x: 0, y: 0, z: 0 };
			const b = inputs.vecB || { x: 0, y: 0, z: 0 };
			return { result: { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z } };
		});
	}
	
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
