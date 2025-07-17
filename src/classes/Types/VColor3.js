/*
	VColor3.js
	----------
	
	Represents a color using red, green, and blue floating-point components.
*/
import VType from '../VType.js';
import { VVector3 } from './VVector3.js';
import { VColor4 } from './VColor4.js';
import { VText } from './VText.js';

export class VColor3 extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Color3';

	/** @type {string} Description */
	static description = 'RGB color with floating-point red, green, and blue values';

	/** @type {string} Theme color */
	static themeColor = '#cc3388';

	/** @type {string} Socket style */
	static socketStyle = 'color3';

	/** @type {*} Default value */
	static defaultValue = { r: 0, g: 0, b: 0 };

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'object' && v !== null &&
		typeof v.r === 'number' && typeof v.g === 'number' && typeof v.b === 'number';

	/** @type {(value: any) => any} */
	static lintFn = (v) => ({
		r: parseFloat(v.r ?? 0),
		g: parseFloat(v.g ?? 0),
		b: parseFloat(v.b ?? 0)
	});

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => (
		Math.abs(a.r - b.r) < 1e-6 &&
		Math.abs(a.g - b.g) < 1e-6 &&
		Math.abs(a.b - b.b) < 1e-6
	);

	/** Static block to register known coalescers */
	static {
		// Vector3 -> Color3
		this.addFromCoalescer(VVector3, (val) => ({ r: val.x, g: val.y, b: val.z }));

		// Color4 -> Color3 (drop alpha)
		this.addFromCoalescer(VColor4, (val) => ({ r: val.r, g: val.g, b: val.b }));

		// Text -> Color3 (JSON with r/g/b)
		this.addFromCoalescer(VText, (val) => {
			try {
				const obj = JSON.parse(val);
				if (typeof obj.r === 'number' && typeof obj.g === 'number' && typeof obj.b === 'number') return obj;
			} catch {}
			return undefined;
		});

		// Color3 -> Vector3
		this.addToCoalescer(VVector3, (val) => ({ x: val.r, y: val.g, z: val.b }));

		// Color3 -> Color4 (default a = 1.0)
		this.addToCoalescer(VColor4, (val) => ({ r: val.r, g: val.g, b: val.b, a: 1.0 }));

		// Color3 -> Text
		this.addToCoalescer(VText, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}({ r: ${this.value.r}, g: ${this.value.g}, b: ${this.value.b} })`;
	}
}
