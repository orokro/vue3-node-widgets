/*
	RandomV3Node.js
	---------------

	Picks a random Vector3 within a specified range.
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
export default class RandomV3Node extends NWNode {

	// static properties for the class
	static nodeName = 'Random Vector3';
	static icon = 'random-color';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'v3Min',
			title: 'Minimum VVector3',
			description: "Minimum VVector3 values for random generation, in a Vector 2 format", 
			type: VVector3,
		});	

		this.addField(FIELD_TYPE.INPUT, {
			name: 'v3Max',
			title: 'Maximum VVector3',
			description: "Maximum VVector3 values for random generation, in a Vector 2 format", 
			type: VVector3,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Random VVector3 Result', 
			description: "Random VVector3 result within the specified min and max range",
			type: VVector3,
		});
	}

	/**
	 * Constructor
	 */
	constructor() {
		super();

		this.fieldState.v3Min.val = {x: 0, y: 0, z: 0};
		this.fieldState.v3Max.val = {x: 1, y: 1, z: 1};
	}

}
