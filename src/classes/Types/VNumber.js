/*
 	VNumber.js
	----------
	
	Represents any floating-point number (positive or negative).
	This is the default numeric type used in the system.
*/
import VType from '../VType.js';

export class VNumber extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Number';

	/** @type {string} Description */
	static description = 'A positive or negative floating-point number';

	/** @type {string} Theme color */
	static themeColor = '#3366cc';

	/** @type {string} Socket style */
	static socketStyle = 'circle';

	/** @type {*} Default value */
	static defaultValue = 0.0;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'number' && isFinite(v);

	/** @type {(value: any) => any} */
	static lintFn = (v) => parseFloat(v);

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => Math.abs(a - b) < 1e-9;

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(${this.value.toFixed(6)})`;
	}
}
