/*
	CombineRGBNode.js
	-----------------

	Combines RGB components into a single color node.
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
export default class CombineRGBNode extends NWNode {

	// static properties for the class
	static nodeName = 'Combine RGB';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'r',
			title: 'R', 
			description: "Red component of the color",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'g',
			title: 'G', 
			description: "Green component of the color",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'b',
			title: 'B', 
			description: "Blue component of the color",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'col',
			title: 'Output Color', 
			description: "Combined RGB color",
			type: VColor3,
		});	

	}
	
	
	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
