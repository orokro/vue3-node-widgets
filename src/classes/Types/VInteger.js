/*
	VInteger
	--------

	Represents a whole number without decimal places.
*/
import VType from '../VType.js';
import { VNumber } from './VNumber.js';
import { VBoolean } from './VBoolean.js';
// Removed circular import: import { VCharacter } from './VCharacter.js';
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

}
