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

		this.setEvalFunction((inputs) => {
			const h = ((inputs.hue ?? 0) / 360 + 1) % 1; // normalize to 0-1
			const s = inputs.saturation ?? 0;
			const v = inputs.value      ?? 0;
			if (s === 0) return { col: { r: v, g: v, b: v } };
			const i = Math.floor(h * 6);
			const f = h * 6 - i;
			const p = v * (1 - s);
			const q = v * (1 - f * s);
			const t = v * (1 - (1 - f) * s);
			let r, g, b;
			switch (i % 6) {
				case 0: r=v; g=t; b=p; break;
				case 1: r=q; g=v; b=p; break;
				case 2: r=p; g=v; b=t; break;
				case 3: r=p; g=q; b=v; break;
				case 4: r=t; g=p; b=v; break;
				default: r=v; g=p; b=q;
			}
			return { col: { r, g, b } };
		});
	}
	
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
