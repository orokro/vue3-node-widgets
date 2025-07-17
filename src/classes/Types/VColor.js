import VType from '../VType.js';
import { VFloat } from './VFloat.js';

export class VColor extends VType {
	static typeName = 'Color';
	static description = 'RGB color as hex';
	static themeColor = '#8844cc';
	static defaultValue = '#000000';

	static validateFn = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
	static lintFn = (v) => String(v).toLowerCase();

	static fromCoalescers = new Map([
		[VFloat, (f) => {
			const gray = Math.max(0, Math.min(255, Math.round(f * 255)));
			const hex = gray.toString(16).padStart(2, '0');
			return `#${hex}${hex}${hex}`;
		}]
	]);

	static toCoalescers = new Map([
		[VFloat, (hex) => {
			const r = parseInt(hex.slice(1, 3), 16);
			return r / 255;
		}]
	]);
}
