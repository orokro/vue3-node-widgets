/*
 	VNumber.js
	----------
	
	Represents any floating-point number (positive or negative).
	This is the default numeric type used in the system.
*/
import VType from '../VType.js';
import { VInteger } from './VInt.js';
import { VBoolean } from './VBoolean.js';
import { VText } from './VText.js';

export class VNumber extends VType {

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

	/** Static block to register known coalescers */
	static {
		// Integer -> Number
		this.addFromCoalescer(VInteger, (val) => parseFloat(val));

		// Boolean -> Number
		this.addFromCoalescer(VBoolean, (val) => val ? 1.0 : 0.0);

		// Text -> Number (parseInt)
		this.addFromCoalescer(VText, (val) => {
			const parsed = parseFloat(val);
			return isNaN(parsed) ? undefined : parsed;
		});

		// Number -> Text
		this.addToCoalescer(VText, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(${this.value.toFixed(6)})`;
	}
}
