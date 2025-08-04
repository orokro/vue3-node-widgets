/*
	SeparateHSVNode.js
	------------------

	Separates a Color into its Hue, Saturation, and Value components.
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
export default class SeparateHSVNode extends NWNode {

	// static properties for the class
	static nodeName = 'Separate HSV';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'col',
			title: 'Input Color', 
			description: "Color to break into HSV components",
			type: VColor3,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'h',
			title: 'Hue', 
			description: "Hue component of the color",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 's',
			title: 'Saturation', 
			description: "Saturation component of the color",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'v',
			title: 'Value', 
			description: "Value component of the color",
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
