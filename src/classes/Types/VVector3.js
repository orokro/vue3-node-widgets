/*
	VVector3.js
	-----------

	Represents a 3D vector with x, y, and z components.
*/
import VType from '../VType.js';
import { VNumber } from './VNumber.js';
import { VVector2 } from './VVector2.js';
import { VText } from './VText.js';
import { VColor3 } from './VColor3.js';

export class VVector3 extends VType {

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

	/** Static block to register known coalescers */
	static {
		// Number -> Vector3 (duplicate to all components)
		this.addFromCoalescer(VNumber, (val) => ({ x: val, y: val, z: val }));

		// Vector2 -> Vector3 (z = 0)
		this.addFromCoalescer(VVector2, (val) => ({ x: val.x, y: val.y, z: 0 }));

		// Color3 -> Vector3 (r/g/b to x/y/z)
		this.addFromCoalescer(VColor3, (val) => ({ x: val.r, y: val.g, z: val.b }));

		// Text -> Vector3 (parse JSON with x/y/z)
		this.addFromCoalescer(VText, (val) => {
			try {
				const obj = JSON.parse(val);
				if (typeof obj.x === 'number' && typeof obj.y === 'number' && typeof obj.z === 'number') return obj;
			} catch {}
			return undefined;
		});

		// Vector3 -> Number (magnitude)
		this.addToCoalescer(VNumber, (val) => Math.sqrt(val.x ** 2 + val.y ** 2 + val.z ** 2));

		// Vector3 -> Vector2 (drop z)
		this.addToCoalescer(VVector2, (val) => ({ x: val.x, y: val.y }));

		// Vector3 -> Color3 (x/y/z to r/g/b)
		this.addToCoalescer(VColor3, (val) => ({ r: val.x, g: val.y, b: val.z }));

		// Vector3 -> Text
		this.addToCoalescer(VText, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}({ x: ${this.value.x}, y: ${this.value.y}, z: ${this.value.z} })`;
	}
}
