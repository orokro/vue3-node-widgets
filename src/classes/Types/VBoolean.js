/*
	VBoolean.js
	----------- 
	
	Represents a true/false logical value.
*/
import VType from '../VType.js';

export class VBoolean extends VType {
	
	static {
		this.init();
	}
	
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

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(${this.value})`;
	}
}
