/*
	SeparateRGBNode.js
	------------------

	Separates a Color into its R, G, and B components.
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
export default class SeparateRGBNode extends NWNode {

	// static properties for the class
	static nodeName = 'Separate RGB';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'col',
			title: 'Input Color', 
			description: "Color to break into RGB components",
			type: VColor3,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'r',
			title: 'R', 
			description: "Red component of the color",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'g',
			title: 'G', 
			description: "Green component of the color",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'b',
			title: 'B', 
			description: "Blue component of the color",
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
