/*
	V3SeparateXYNode.js
	-------------------

	Separates a Vector3 into its X, Y, and Z components.
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
export default class V3SeparateXYNode extends NWNode {

	// static properties for the class
	static nodeName = 'Separate XYZ';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vecA',
			title: 'Input Vector', 
			description: "Vector to break into components",
			type: VVector3,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'x',
			title: 'X', 
			description: "X component of the vector",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'y',
			title: 'Y', 
			description: "Y component of the vector",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'z',
			title: 'Z', 
			description: "Z component of the vector",
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
