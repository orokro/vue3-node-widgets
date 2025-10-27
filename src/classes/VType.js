/*
	VType.js
	--------

	This file will provide a base class for the value types the node system will use.

	We'll define a number of built-in types, but the consumers of the library can make their 
	own types by extending this class and providing the necessary properties and methods.

	A few notes on the properties:
	- `name`: the name of the type, used for display and identification - this should be unique
	- `description`: a description of the type, used for display, not strictly required but recommended
	- `themeColor`: a hex color string representing the theme color for this type, used for display & for the socket color
	- `socketStyle`: the style of socket to use for this type, default is 'default' but can be overridden. See the socket rendering code for more details.

*/

// the default widget to use if the subclass does not specify one
import NDefaultWidget from "@/components/TypeWidgets/NDefaultWidget.vue";

// main export
export default class VType {

	/** @type {string} Human-readable type name */
	static typeName = 'UnnamedType';

	/** @type {string} Optional description of the type */
	static description = '';

	/** @type {string} Hex color for visual representation */
	static themeColor = '#000000';

	/** @type {string} string with normalized border-radius between 0-10 */
	static socketStyle = '10,10,10,10';

	/** @type {Map<Function, Function>} From other types TO this type */
	static fromCoalescers = new Map();

	/** @type {Map<Function, Function>} FROM this type TO others */
	static toCoalescers = new Map();

	/** @type {*} Default value for this type */
	static defaultValue = null;

	/** @type {Function} the Vue component constructor to use for this type in default node UI */
	static nodeWidgetComponent = NDefaultWidget;

	/** @type {(value: any) => any} Lint function (e.g., auto-fix/normalize) */
	static lintFn = (value) => value;

	/** @type {(value: any) => boolean} Validate function */
	static validateFn = (value) => true;

	/** @type {(a: any, b: any) => boolean} Compare function */
	static compareFn = (a, b) => a === b;

	/** Add a from-coalescer */
	static addFromCoalescer(sourceType, fn) {
		this.fromCoalescers.set(sourceType, (val) => new this(fn(val)));
	}


	/** Add a to-coalescer */
	static addToCoalescer(targetType, fn) {
		this.toCoalescers.set(targetType, (val) => new targetType(fn(val)));
	}


	/** Retrieve a coalescer from another type to this one */
	static getFromCoalescer(sourceType) {
		return this.fromCoalescers.get(sourceType);
	}


	/** Retrieve a coalescer from this type to another */
	static getToCoalescer(targetType) {
		return this.toCoalescers.get(targetType);
	}

	
	/** Validate a value against this type */
	static validate(value) {
		return this.validateFn(value);
	}


	/** Lint a value */
	static lint(value) {
		return this.lintFn(value);
	}


	/** Compare two values */
	static compare(a, b) {
		return this.compareFn(a, b);
	}


	static init() {

		this.fromCoalescers = new Map();
		this.toCoalescers = new Map();
		this.nodeWidgetComponent = NDefaultWidget;
		this.lintFn = (value) => value;
		this.validateFn = (value) => true;
		this.compareFn = (a, b) => a === b;
		this.defaultValue = null;
		this.themeColor = '#000000';
		this.socketStyle = 'circle';
		this.typeName = 'UnnamedType';
		this.description = '';
		this.static = this.constructor;
	}


	// so we can do some kind of "currying" with the types
	static addConstructorParam(param) {

		// extend our self
		const Subclass = class extends this {

			// no change - just use the parent constructor
			constructor(...args) { super(...args); }
		};

		// Merge in params
		Subclass.params = {...(this.params || {}), ...param };

		// return the subclass
		return Subclass;
	}


	/** Default constructor */
	constructor(value) {

		this.static = this.constructor;
		if(value)
			value = this.static.lintFn(value);
		
		this.value = value || this.constructor.defaultValue;
	}


	/** get the value */
	get() {
		return this.value;
	}


	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(${JSON.stringify(this.value)})`;
	}

}
