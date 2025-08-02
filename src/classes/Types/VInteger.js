/*
	VInteger
	--------

	Represents a whole number without decimal places.
*/
import VType from '../VType.js';
import NVIntegerWidget from '@/components/TypeWidgets/NVIntegerWidget.vue';

export class VInteger extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Integer';

	/** @type {string} Description */
	static description = 'A whole number (no decimal part)';

	/** @type {string} Theme color */
	static themeColor = '#cc3333';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVIntegerWidget;

	/** @type {string} Socket style */
	static socketStyle = 'R,R,R,R,0';

	/** @type {*} Default value */
	static defaultValue = 0;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => {
		try{
			v = parseFloat(v);
		}catch(e){
			return false;
		}
		return typeof v === 'number' && Number.isInteger(v);
	};

	/** @type {(value: any) => any} */
	static lintFn = (v) => Math.round(Number(v));

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	static min = null;
	static max = null;

	/** Default constructor */
	constructor(value) {

		super(value);

		this.static.min = this.static.params?.min ? this.static.params.min : null;
		this.static.max = this.static.params?.max ? this.static.params.max : null;
	}

	static Min(min){
		return this.addConstructorParam({min});
	}

	static Max(max){
		return this.addConstructorParam({max});
	}
}
