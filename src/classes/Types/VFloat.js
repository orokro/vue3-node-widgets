import VType from '../VType.js';

export class VFloat extends VType {
	static typeName = 'Float';
	static description = 'Floating-point number';
	static themeColor = '#3366cc';
	static defaultValue = 0.0;

	static validateFn = (v) => typeof v === 'number';
	static lintFn = (v) => parseFloat(v);
}
