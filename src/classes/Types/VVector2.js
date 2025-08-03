/*
	VVector2.js
	-----------

	Represents a 2D vector with x and y components.
*/
import VType from '../VType.js';
import NVVector2Widget from '@/components/TypeWidgets/NVVector2Widget.vue';

export class VVector2 extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Vector2';

	/** @type {string} Description */
	static description = 'A 2D vector with x and y floating-point components';

	/** @type {string} Theme color */
	// static themeColor = '#44aa88';
	static themeColor = '#9999ff';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVVector2Widget;

	/** @type {string} Socket style */
	static socketStyle = 'R,S,R,S,45';

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

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}({ x: ${this.value.x}, y: ${this.value.y} })`;
	}
}
