/*
	V2SeparateXYNode.js
	-------------------

	Separates a Vector2 into its X and Y components.
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
export default class V2SeparateXYNode extends NWNode {

	// static properties for the class
	static nodeName = 'Separate XY';
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
			type: VVector2,
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
	}
	
	
	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
