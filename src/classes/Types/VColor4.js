/*
	VColor4
	-------

	Represents a color using red, green, blue, and alpha floating-point components.
*/
import VType from '../VType.js';
// Removed circular import: import { VColor3 } from './VColor3.js';
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
		typeof v.r === 'number' && typeof v.g === 'number' &&
		typeof v.b === 'number' && typeof v.a === 'number';

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

}
