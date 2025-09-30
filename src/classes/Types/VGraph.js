/*
	VGraph.js
	---------

	Stores a subgraph.

	This is a special type, basically just for Group-nodes.
	I doubt any other node would use this type.
*/
import VType from '../VType.js';
import NVGraphWidget from '@/components/TypeWidgets/NVGraphWidget.vue';
import { NWGraph } from '../NWGraph.js';

export class VGraph extends VType {
	
	static {
		this.init();
	}
	
	/** @type {string} Human-readable name */
	static typeName = 'Graph';

	/** @type {string} Description */
	static description = 'A Node (Sub) Graph';

	/** @type {string} Theme color */
	static themeColor = '#00ABAE';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVGraphWidget;

	/** @type {string} Socket style */
	static socketStyle = 'R,R,R,R,0';

	/** @type {*} Default value */
	static defaultValue = 0;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => true;

	/** @type {(value: any) => any} */
	static lintFn = (v) => true;

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a === b;

	/** Default constructor */
	constructor(value) {
		super(value);

		this.value = new NWGraph(true);
	}

}
