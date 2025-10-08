/*
	VGroupAny.js
	------------

	This is a special use-case type:

	Group Input nodes & Group Output nodes will have sockets
	that allow arbitrary wires to be connected to them.

	These wires can be of any type, and the group node will
	adapt to the types connected to these nodes.

	Therefore, it's unlikely this type will be used outside either:
	- GroupInputNode
	- GroupOutputNode

	We'll add some extra logic in connection manager, to check for this type
	and automatically turn off the type-checking for these (wires) connections.
*/
import VType from '../VType.js';

export class VGroupAny extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Group Any';

	/** @type {string} Description */
	static description = 'Connect Anything (For Group I/O)';

	/** @type {string} Theme color */
	static themeColor = '#777';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = null;

	/** @type {string} Socket style */
	static socketStyle = '10,10,10,10';

	/** @type {*} Default value */
	static defaultValue = '';

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => true;

	/** @type {(value: any) => any} */
	static lintFn = (v) => true;

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Custom string representation */
	toString() {
		return `${this.constructor.typeName}(\"${this.value}\")`;
	}

	/** Default constructor */
	constructor(value) {

		super(value);
	}

}
