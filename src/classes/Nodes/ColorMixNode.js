/*
	ColorMixNode.js
	---------------

	This will be a node that provides a color mixing interface, allowing users to blend two or more colors.
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
export default class ColorMixNode extends NWNode {

	// static properties for the class
	static nodeName = 'Color Mix';
	static icon = 'color-mix';
	
	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'aCol',
			title: 'A Color', 
			description: "A color for mix operations",
			type: VColor3,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'bCol',
			title: 'B Value', 
			description: "B color for mix operations",
			type: VColor3,
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
			description: "Result of Color Mix operation",
			type: VColor3,
		});

	}
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
