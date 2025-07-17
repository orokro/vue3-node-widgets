/*
	VBoolean.js
	----------- 
	
	Represents a true/false logical value.
*/
import VType from '../VType.js';
import { VInteger } from './VInteger.js';
import { VNumber } from './VNumber.js';
import { VText } from './VText.js';

export class VBoolean extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Boolean';

	/** @type {string} Description */
	static description = 'A binary value representing true or false';

	/** @type {string} Theme color */
	static themeColor = '#559966';

	/** @type {string} Socket style */
	static socketStyle = 'boolean';

	/** @type {*} Default value */
	static defaultValue = false;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'boolean';

	/** @type {(value: any) => any} */
	static lintFn = (v) => Boolean(v);

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Static block to register known coalescers */
	static {
		// Integer -> Boolean (0 = false, else true)
		this.addFromCoalescer(VInteger, (val) => val !== 0);

		// Number -> Boolean (0 = false, else true)
		this.addFromCoalescer(VNumber, (val) => val !== 0);

		// Text -> Boolean (non-empty truthy except special falsey cases)
		this.addFromCoalescer(VText, (val) => {
			if (typeof val !== 'string') return true;
			const lower = val.toLowerCase();
			return !(val === '' || lower === 'false' || lower === '0' || lower === '0.0');
		});

		// Boolean -> Integer
		this.addToCoalescer(VInteger, (val) => (val ? 1 : 0));

		// Boolean -> Text
		this.addToCoalescer(VText, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(${this.value})`;
	}
}
