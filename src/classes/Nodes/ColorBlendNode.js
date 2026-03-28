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

		this.setEvalFunction((inputs) => {
			const a  = inputs.colA || { r: 0, g: 0, b: 0 };
			const b  = inputs.colB || { r: 0, g: 0, b: 0 };
			const op = inputs.operation ?? 0;

			function clamp01(v) { return Math.min(1, Math.max(0, v)); }

			// RGB to HSV and back for Hue/Saturation/Color/Luminosity modes
			function rgbToHsv(r, g, b) {
				const max = Math.max(r, g, b), min = Math.min(r, g, b);
				const v = max;
				const d = max - min;
				const s = max === 0 ? 0 : d / max;
				let h = 0;
				if (d > 0) {
					if (max === r) h = ((g - b) / d) % 6;
					else if (max === g) h = (b - r) / d + 2;
					else h = (r - g) / d + 4;
					h = (h / 6 + 1) % 1;
				}
				return { h, s, v };
			}

			function hsvToRgb(h, s, v) {
				if (s === 0) return { r: v, g: v, b: v };
				const i = Math.floor(h * 6);
				const f = h * 6 - i;
				const p = v * (1 - s);
				const q = v * (1 - f * s);
				const t = v * (1 - (1 - f) * s);
				switch (i % 6) {
					case 0: return { r: v, g: t, b: p };
					case 1: return { r: q, g: v, b: p };
					case 2: return { r: p, g: v, b: t };
					case 3: return { r: p, g: q, b: v };
					case 4: return { r: t, g: p, b: v };
					default: return { r: v, g: p, b: q };
				}
			}

			let r, g, b2;
			switch (op) {
				case 0:  // Mix (average)
					r = (a.r + b.r) / 2; g = (a.g + b.g) / 2; b2 = (a.b + b.b) / 2; break;
				case 1:  // Add
					r = a.r + b.r; g = a.g + b.g; b2 = a.b + b.b; break;
				case 2:  // Subtract
					r = a.r - b.r; g = a.g - b.g; b2 = a.b - b.b; break;
				case 3:  // Multiply
					r = a.r * b.r; g = a.g * b.g; b2 = a.b * b.b; break;
				case 4:  // Screen
					r = 1-(1-a.r)*(1-b.r); g = 1-(1-a.g)*(1-b.g); b2 = 1-(1-a.b)*(1-b.b); break;
				case 5: { // Overlay
					const ov = (x, y) => x < 0.5 ? 2*x*y : 1-2*(1-x)*(1-y);
					r = ov(a.r, b.r); g = ov(a.g, b.g); b2 = ov(a.b, b.b); break;
				}
				case 6:  // Darken
					r = Math.min(a.r,b.r); g = Math.min(a.g,b.g); b2 = Math.min(a.b,b.b); break;
				case 7:  // Lighten
					r = Math.max(a.r,b.r); g = Math.max(a.g,b.g); b2 = Math.max(a.b,b.b); break;
				case 8:  // Difference
					r = Math.abs(a.r-b.r); g = Math.abs(a.g-b.g); b2 = Math.abs(a.b-b.b); break;
				case 9:  // Exclusion
					r = a.r+b.r-2*a.r*b.r; g = a.g+b.g-2*a.g*b.g; b2 = a.b+b.b-2*a.b*b.b; break;
				case 10: { // Hue (take H from b, SV from a)
					const ha = rgbToHsv(a.r,a.g,a.b);
					const hb = rgbToHsv(b.r,b.g,b.b);
					const out = hsvToRgb(hb.h, ha.s, ha.v);
					r=out.r; g=out.g; b2=out.b; break;
				}
				case 11: { // Saturation (take S from b)
					const ha = rgbToHsv(a.r,a.g,a.b);
					const hb = rgbToHsv(b.r,b.g,b.b);
					const out = hsvToRgb(ha.h, hb.s, ha.v);
					r=out.r; g=out.g; b2=out.b; break;
				}
				case 12: { // Color (take HS from b)
					const ha = rgbToHsv(a.r,a.g,a.b);
					const hb = rgbToHsv(b.r,b.g,b.b);
					const out = hsvToRgb(hb.h, hb.s, ha.v);
					r=out.r; g=out.g; b2=out.b; break;
				}
				case 13: { // Luminosity (take V from b)
					const ha = rgbToHsv(a.r,a.g,a.b);
					const hb = rgbToHsv(b.r,b.g,b.b);
					const out = hsvToRgb(ha.h, ha.s, hb.v);
					r=out.r; g=out.g; b2=out.b; break;
				}
				default: r = a.r; g = a.g; b2 = a.b;
			}
			return { result: { r: clamp01(r), g: clamp01(g), b: clamp01(b2) } };
		});
	}
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
