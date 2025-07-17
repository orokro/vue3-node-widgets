/*
	VColor3
	-------

	Represents a color using red, green, and blue floating-point components.
*/
import VType from '../VType.js';

export class VColor3 extends VType {
	
	static {
		this.init();
	}
	
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

}
