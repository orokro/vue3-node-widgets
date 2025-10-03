/*
	V3DotNode.js
	------------

	Does the dot product of two vector 3s
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
export default class V3DotNode extends NWNode {

	// static properties for the class
	static nodeName = 'V3 Dot Product';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecA',
			title: 'Vector A', 
			description: "Vector to dot with",
			type: VVector3,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecB',
			title: 'Vector B', 
			description: "Vector to dot with",
			type: VVector3,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Dot Product', 
			description: "Dot product of the two vectors",
			type: VNumber,
		});
	}
	
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
