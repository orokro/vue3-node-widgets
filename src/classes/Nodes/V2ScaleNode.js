/*
	V2ScaleNode.js
	--------------

	Scales a vector 2
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
export default class V2ScaleNode extends NWNode {

	// static properties for the class
	static nodeName = 'V2 Scale';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'vec',
			title: 'Vector Value', 
			description: "Vector to scale",
			type: VVector2,
		});	
	
		this.addField(FIELD_TYPE.INPUT, { 
			name: 'scaleValue',
			title: 'Scale Value', 
			description: "Scale factor for the vector",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Scaled Vector', 
			description: "Scaled Vector",
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
