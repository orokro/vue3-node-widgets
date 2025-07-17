import VType from '../VType.js';
import { VFloat } from './VFloat.js';

export class VVector2 extends VType {
	static typeName = 'Vector2';
	static description = '2D vector';
	static themeColor = '#44aa88';
	static defaultValue = { x: 0, y: 0 };

	static validateFn = (v) => typeof v === 'object' && v !== null &&
		typeof v.x === 'number' && typeof v.y === 'number';

	static lintFn = (v) => ({
		x: parseFloat(v.x || 0),
		y: parseFloat(v.y || 0)
	});

	static fromCoalescers = new Map([
		[VFloat, (f) => ({ x: f, y: f })]
	]);

	static toCoalescers = new Map([
		[VFloat, (vec) => (vec.x + vec.y) / 2]
	]);
}
