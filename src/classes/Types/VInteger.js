/*
	VInteger
	--------
	
	Represents a whole number without decimal places.
*/
import VType from '../VType.js';
import { VNumber } from './VNumber.js';
import { VBoolean } from './VBoolean.js';
import { VCharacter } from './VCharacter.js';
import { VText } from './VText.js';

export class VInteger extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Integer';

	/** @type {string} Description */
	static description = 'A whole number (no decimal part)';

	/** @type {string} Theme color */
	static themeColor = '#cc3333';

	/** @type {string} Socket style */
	static socketStyle = 'square';

	/** @type {*} Default value */
	static defaultValue = 0;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => Number.isInteger(v);

	/** @type {(value: any) => any} */
	static lintFn = (v) => Math.round(Number(v));

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Static block to register known coalescers */
	static {
		// Number -> Integer (round to nearest)
		this.addFromCoalescer(VNumber, (val) => Math.round(val));

		// Boolean -> Integer
		this.addFromCoalescer(VBoolean, (val) => val ? 1 : 0);

		// Character -> Integer (ASCII value)
		this.addFromCoalescer(VCharacter, (val) => val.charCodeAt(0));

		// Text -> Integer (parseInt)
		this.addFromCoalescer(VText, (val) => {
			const parsed = parseInt(val, 10);
			return isNaN(parsed) ? undefined : parsed;
		});

		// Integer -> Number
		this.addToCoalescer(VNumber, (val) => parseFloat(val));

		// Integer -> Character
		this.addToCoalescer(VCharacter, (val) => String.fromCharCode(val));

		// Integer -> Text
		this.addToCoalescer(VText, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(${this.value})`;
	}
}
