/*
	VBoolean.js
	----------- 
	
	Represents a true/false logical value.
*/
import VType from '../VType.js';
import NVBooleanWidget from '@/components/TypeWidgets/NVBooleanWidget.vue';

export class VBoolean extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Boolean';

	/** @type {string} Description */
	static description = 'A binary value representing true or false';

	/** @type {string} Theme color */
	static themeColor = 'lightgray';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVBooleanWidget;

	/** @type {string} Socket style */
	static socketStyle = '10,10,0,0';

	/** @type {*} Default value */
	static defaultValue = false;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => typeof v === 'boolean';

	/** @type {(value: any) => any} */
	static lintFn = (v) => Boolean(v);

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(${this.value})`;
	}

	static offText = "False";
	static onText = "True";

	/** Default constructor */
	constructor(value) {

		super(value);

		this.static.offText = this.static.params?.offText ? this.static.params.offText : "False";
		this.static.onText = this.static.params?.onText ? this.static.params.onText : "True";
	}

	static OffLabel(offText){
		return this.addConstructorParam({offText});
	}

	static OnLabel(onText){
		return this.addConstructorParam({onText});
	}

}
