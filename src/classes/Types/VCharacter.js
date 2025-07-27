/*
	VCharacter
	----------

	Represents a single character.
*/
import VType from '../VType.js';
import NVCharacterWidget from '@/components/TypeWidgets/NVCharacterWidget.vue';

export class VCharacter extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Character';

	/** @type {string} Description */
	static description = 'A single character (text length = 1)';

	/** @type {string} Theme color */
	static themeColor = '#aa88ee';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVCharacterWidget;

	/** @type {string} Socket style */
	static socketStyle = 'character';

	/** @type {*} Default value */
	static defaultValue = 'A';

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'string' && v.length === 1;

	/** @type {(value: any) => any} */
	static lintFn = (v) => String(v ?? '').charAt(0);

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}('${this.value}')`;
	}
}
