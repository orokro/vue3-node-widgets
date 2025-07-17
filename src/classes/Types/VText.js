/*
	VText.js
	--------

	Represents a string of one or more characters.
*/
import VType from '../VType.js';
import { VCharacter } from './VCharacter.js';

export class VText extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Text';

	/** @type {string} Description */
	static description = 'A string of characters';

	/** @type {string} Theme color */
	static themeColor = '#8888cc';

	/** @type {string} Socket style */
	static socketStyle = 'text';

	/** @type {*} Default value */
	static defaultValue = '';

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'string';

	/** @type {(value: any) => any} */
	static lintFn = (v) => String(v ?? '');

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Static block to register known coalescers */
	static {
		// Character -> Text (wrap single char as string)
		this.addFromCoalescer(VCharacter, (val) => val);

		// Text -> Character (first character only)
		this.addToCoalescer(VCharacter, (val) => val.charAt(0));

		// Anything -> Text (fallback, stringify .value only)
		this.addFromCoalescer(VType, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}("${this.value}")`;
	}
}
