/*
	VVector2.js
	-----------

	Represents a 2D vector with x and y components.
*/
import VType from '../VType.js';
import { VNumber } from './VNumber.js';
import { VVector3 } from './VVector3.js';
import { VText } from './VText.js';

export class VVector2 extends VType {

	/** @type {string} Human-readable name */
	static typeName = 'Vector2';

	/** @type {string} Description */
	static description = 'A 2D vector with x and y floating-point components';

	/** @type {string} Theme color */
	static themeColor = '#44aa88';

	/** @type {string} Socket style */
	static socketStyle = 'vector';

	/** @type {*} Default value */
	static defaultValue = { x: 0, y: 0 };

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'object' && v !== null &&
		typeof v.x === 'number' && typeof v.y === 'number';

	/** @type {(value: any) => any} */
	static lintFn = (v) => ({
		x: parseFloat(v.x ?? 0),
		y: parseFloat(v.y ?? 0)
	});

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;

	/** Static block to register known coalescers */
	static {
		// Number -> Vector2 (duplicate number to x/y)
		this.addFromCoalescer(VNumber, (val) => ({ x: val, y: val }));

		// Vector3 -> Vector2 (drop z)
		this.addFromCoalescer(VVector3, (val) => ({ x: val.x, y: val.y }));

		// Text -> Vector2 (parse JSON with x/y)
		this.addFromCoalescer(VText, (val) => {
			try {
				const obj = JSON.parse(val);
				if (typeof obj.x === 'number' && typeof obj.y === 'number') return obj;
			} catch {}
			return undefined;
		});

		// Vector2 -> Number (magnitude)
		this.addToCoalescer(VNumber, (val) => Math.sqrt(val.x ** 2 + val.y ** 2));

		// Vector2 -> Vector3 (z = 0)
		this.addToCoalescer(VVector3, (val) => ({ x: val.x, y: val.y, z: 0 }));

		// Vector2 -> Text
		this.addToCoalescer(VText, (val) => JSON.stringify(val));
	}

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}({ x: ${this.value.x}, y: ${this.value.y} })`;
	}
}
