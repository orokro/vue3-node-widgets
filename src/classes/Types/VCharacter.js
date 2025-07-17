/*
	VCharacter.js
	-------------
	
	Represents a single character.
*/
import VType from '../VType.js';
import { VText } from './VText.js';
import { VInteger } from './VInteger.js';

export class VCharacter extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Character';

	/** @type {string} Description */
	static description = 'A single character (text length = 1)';

	/** @type {string} Theme color */
	static themeColor = '#aa88ee';

	/** @type {string} Socket style */
	static socketStyle = 'character';

	/** @type {*} Default value */
	static defaultValue = 'A';

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'string' && v.length === 1;

	/** @type {(value: any) => any} */
	static lintFn = (v) => String(v ?? '').charAt(0);

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Static block to register known coalescers */
	static {
		// Integer -> Character (from char code)
		this.addFromCoalescer(VInteger, (val) => String.fromCharCode(val));

		// Text -> Character (use first char)
		this.addFromCoalescer(VText, (val) => val.charAt(0));

		// Character -> Integer (to char code)
		this.addToCoalescer(VInteger, (val) => val.charCodeAt(0));

		// Character -> Text (wrapped in string)
		this.addToCoalescer(VText, (val) => val);
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}('${this.value}')`;
	}
}
