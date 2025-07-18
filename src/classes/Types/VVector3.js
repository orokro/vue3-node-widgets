/*
	VVector3.js
	-----------

	Represents a 3D vector with x, y, and z components.
*/
import VType from '../VType.js';

export class VVector3 extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Vector3';

	/** @type {string} Description */
	static description = 'A 3D vector with x, y, and z floating-point components';

	/** @type {string} Theme color */
	static themeColor = '#2288cc';

	/** @type {string} Socket style */
	static socketStyle = 'vector3';

	/** @type {*} Default value */
	static defaultValue = { x: 0, y: 0, z: 0 };

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'object' && v !== null &&
		typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number';

	/** @type {(value: any) => any} */
	static lintFn = (v) => ({
		x: parseFloat(v.x ?? 0),
		y: parseFloat(v.y ?? 0),
		z: parseFloat(v.z ?? 0)
	});

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => (
		Math.abs(a.x - b.x) < 1e-6 &&
		Math.abs(a.y - b.y) < 1e-6 &&
		Math.abs(a.z - b.z) < 1e-6
	);

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}({ x: ${this.value.x}, y: ${this.value.y}, z: ${this.value.z} })`;
	}
}
