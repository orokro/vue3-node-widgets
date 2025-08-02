/*
	VEnum.js
	--------
	
	This will be the list of strings we use for combo boxes / props.
*/

import VType from '../VType.js';
import NVEnumComboWidget from '@/components/TypeWidgets/NVEnumComboWidget.vue';

export class VEnum extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Enumeration';

	/** @type {string} Description */
	static description = 'A list of indexed strings to switch between';

	/** @type {string} Theme color */
	static themeColor = '#3366cc';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVEnumComboWidget;
	
	/** @type {string} Socket style */
	static socketStyle = 'S,S,S,S,0';

	/** @type {*} Default value (index 0) */
	static defaultValue = 0;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => {

		try{
			v = parseInt(v, 10);
		}catch(e){
			return false;
		}

		if(v<0 || v>=this.itemsCount){
			return false;
		}
	}

	/** @type {(value: any) => any} */
	static lintFn = (v) => parseFloat(v);

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a==b;

	/** Custom string representation */
	toString() {
		// return `${this.constructor.typeName}(${this.value.toFixed(3)})`;
		return '';
	}

	static itemsCount = 0;
	static items = ["default"];

	/** Default constructor */
	constructor(value) {

		super(value);
		this.items = this.static.params?.initialItems || ["default"];
		this.static.items = this.items;
		this.static.itemsCount = this.items.length;
	}

	static With(items){
		return this.addConstructorParam({initialItems: items});
	}

}
