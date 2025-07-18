/*
	VAngle.js
	---------
	
	Represents an angle in degrees or radians depending on UI context.
	Functionally identical to VNumber, but rendered differently in the UI.
*/
import VType from '../VType.js';

export class VAngle extends VType {

	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Angle';

	/** @type {string} Description */
	static description = 'A floating-point number interpreted as an angle';

	/** @type {string} Theme color */
	static themeColor = '#ffaa00';

	/** @type {string} Socket style */
	static socketStyle = 'angle';

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
		return `${this.constructor.typeName}(${this.value.toFixed(2)}°)`;
	}
}
