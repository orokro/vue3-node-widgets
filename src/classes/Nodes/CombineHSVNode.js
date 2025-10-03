/*
	CombineHSVNode.js
	-----------------

	Combines HSV components into a single color node.
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
export default class CombineHSVNode extends NWNode {

	// static properties for the class
	static nodeName = 'Combine HSV';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'hue',
			title: 'Hue', 
			description: "Hue component of the color (0-360 degrees)",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'saturation',
			title: 'Saturation', 
			description: "Saturation component of the color (0-1)",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'value',
			title: 'Value', 
			description: "Value component of the color (0-1)",
			type: VNumber,
		});
		

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'col',
			title: 'Output Color', 
			description: "Combined HSV color",
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
