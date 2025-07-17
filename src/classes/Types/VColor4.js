/*
	VColor4.js
	----------
	
	Represents a color using red, green, blue, and alpha components.
*/
import VType from '../VType.js';
import { VColor3 } from './VColor3.js';
import { VText } from './VText.js';

export class VColor4 extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Color4';

	/** @type {string} Description */
	static description = 'RGBA color with floating-point red, green, blue, and alpha values';

	/** @type {string} Theme color */
	static themeColor = '#cc66aa';

	/** @type {string} Socket style */
	static socketStyle = 'color4';

	/** @type {*} Default value */
	static defaultValue = { r: 0, g: 0, b: 0, a: 1.0 };

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'object' && v !== null &&
		typeof v.r === 'number' && typeof v.g === 'number' && typeof v.b === 'number' && typeof v.a === 'number';

	/** @type {(value: any) => any} */
	static lintFn = (v) => ({
		r: parseFloat(v.r ?? 0),
		g: parseFloat(v.g ?? 0),
		b: parseFloat(v.b ?? 0),
		a: parseFloat(v.a ?? 1.0)
	});

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => (
		Math.abs(a.r - b.r) < 1e-6 &&
		Math.abs(a.g - b.g) < 1e-6 &&
		Math.abs(a.b - b.b) < 1e-6 &&
		Math.abs(a.a - b.a) < 1e-6
	);

	/** Static block to register known coalescers */
	static {
		// Color3 -> Color4 (add alpha = 1.0)
		this.addFromCoalescer(VColor3, (val) => ({ r: val.r, g: val.g, b: val.b, a: 1.0 }));

		// Text -> Color4 (JSON with r/g/b/a)
		this.addFromCoalescer(VText, (val) => {
			try {
				const obj = JSON.parse(val);
				if (
					typeof obj.r === 'number' &&
					typeof obj.g === 'number' &&
					typeof obj.b === 'number' &&
					typeof obj.a === 'number'
				) return obj;
			} catch {}
			return undefined;
		});

		// Color4 -> Color3 (drop alpha)
		this.addToCoalescer(VColor3, (val) => ({ r: val.r, g: val.g, b: val.b }));

		// Color4 -> Text
		this.addToCoalescer(VText, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}({ r: ${this.value.r}, g: ${this.value.g}, b: ${this.value.b}, a: ${this.value.a} })`;
	}
}
