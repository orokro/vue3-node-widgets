/*
	VAngle.js
	---------
	
	Represents an angle in degrees or radians depending on UI context.
	Functionally identical to VNumber, but rendered differently in the UI.
*/
import VType from '../VType.js';
import NVAngleWidget from '@/components/TypeWidgets/NVAngleWidget.vue';

export class VAngle extends VType {

	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Angle';

	/** @type {string} Description */
	static description = 'A floating-point number interpreted as an angle';

	/** @type {string} Theme color */
	static themeColor = '#ffaa00';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVAngleWidget;

	/** @type {string} Socket style */
	static socketStyle = 'angle';

	/** @type {*} Default value */
	static defaultValue = 0.0;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => {
		try{
			v = parseFloat(v);
		}catch(e){
			return false;
		}
		return typeof v === 'number' && isFinite(v)
	};

	/** @type {(value: any) => any} */
	static lintFn = (v) => parseFloat(v);

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => Math.abs(a - b) < 1e-9;

	/** Custom string representation */
	toString() {
		return `θ ${this.constructor.typeName}(${this.value.toFixed(2)}°)`;
	}

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
