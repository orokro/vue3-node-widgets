/*
	VText
	-----

	Represents a string of one or more characters.
*/
import VType from '../VType.js';
import NVTextWidget from '@/components/TypeWidgets/NVTextWidget.vue';

export class VText extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Text';

	/** @type {string} Description */
	static description = 'A string of characters';

	/** @type {string} Theme color */
	static themeColor = '#8888cc';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVTextWidget;

	/** @type {string} Socket style */
	static socketStyle = 'S,R,S,R,45';

	/** @type {*} Default value */
	static defaultValue = '';

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'string';

	/** @type {(value: any) => any} */
	static lintFn = (v) => String(v ?? '');

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(\"${this.value}\")`;
	}

	static minLength = null;
	static maxLength = null;

	/** Default constructor */
	constructor(value) {

		super(value);

		this.static.minLength = this.static.params?.min ? this.static.params.min : null;
		this.static.maxLength = this.static.params?.max ? this.static.params.max : null;
	}

	static Min(min){
		return this.addConstructorParam({min});
	}

	static Max(max){
		return this.addConstructorParam({max});
	}
}
