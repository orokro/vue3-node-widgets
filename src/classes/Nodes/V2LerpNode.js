/*
	V2LerpNode.js
	---------------

	Lerps between two Vector2s based on a T value.
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
export default class V2LerpNode extends NWNode {

	// static properties for the class
	static nodeName = 'V2 Lerp';
	static icon = 'vector2';
	
	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'a',
			title: 'A Value', 
			description: "A Vector2 value for lerping",
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'b',
			title: 'B Value', 
			description: "B Vector2 value for lerping",
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'tValue',
			title: 'T Value', 
			description: "T value for mixing between A and B",
			type: VNumber,
		});	
	
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Result', 
			description: "Result of V2 Lerp operation",
			type: VVector2,
		});

	}
	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
