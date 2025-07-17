/*
	VAngles.js
	----------
	
	Represents 3D Euler angles as pitch, yaw, and roll.
	Structurally identical to VVector3 but semantically different.
*/
import VType from '../VType.js';
import { VAngle } from './VAngle.js';
import { VVector3 } from './VVector3.js';
import { VText } from './VText.js';

export class VAngles extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Angles';

	/** @type {string} Description */
	static description = 'Euler angles: pitch (x), yaw (y), and roll (z)';

	/** @type {string} Theme color */
	static themeColor = '#ddaa33';

	/** @type {string} Socket style */
	static socketStyle = 'angles';

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
		return `${this.constructor.typeName}({ pitch: ${this.value.x}, yaw: ${this.value.y}, roll: ${this.value.z} })`;
	}
}
