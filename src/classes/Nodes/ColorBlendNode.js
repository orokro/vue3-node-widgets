/*
	ColorBlendNode.js
	-----------------

	Blending for colors
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
export default class ColorBlendNode extends NWNode {

	// static properties for the class
	static nodeName = 'Color Blend';
	static icon = 'color';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'colA',
			title: 'Color A', 
			description: "A color for blending operations",
			type: VColor3,
		});	
	
		// enumeration
		this.addField(FIELD_TYPE.PROP, { 
			name: 'operation',
			title: 'Operation',
			description: "Color Blending Mode",
			type: VEnum.With([
				'Mix',
				'Add',
				'Subtract',
				'Multiply',
				'Screen',
				'Overlay',
				'Darken',
				'Lighten',
				'Difference',
				'Exclusion',
				'Hue',
				'Saturation',
				'Color',
				'Luminosity',
			]),
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'colB',
			title: 'Color B', 
			description: "B color for blending operations",
			type: VColor3,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Result', 
			description: "Result of Color Blend operation",
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
