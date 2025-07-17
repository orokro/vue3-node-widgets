import VType from '../VType.js';
import { VFloat } from './VFloat.js';

export class VInt extends VType {
	static typeName = 'Integer';
	static description = 'Whole number';
	static themeColor = '#cc3333';
	static defaultValue = 0;

	static validateFn = (v) => Number.isInteger(v);
	static lintFn = (v) => parseInt(v, 10);

	static fromCoalescers = new Map([
		[VFloat, (f) => Math.round(f)]
	]);

	static toCoalescers = new Map([
		[VFloat, (i) => parseFloat(i)]
	]);
}
