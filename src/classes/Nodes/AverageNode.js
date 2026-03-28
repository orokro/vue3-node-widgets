/*
	AverageNode.js
	--------------

	This node will test array inputs and output the average of the numbers.
*/

import NWNode from '../NWNode.js';
import { NODE_TYPE, FIELD_TYPE } from '../NWNode.js';
import { 
	VAngle,
	VAngles,
	VBoolean,
	VCharacter,
	VColor3,
	VColor4,
	VInteger,
	VNumber,
	VText,
	VVector2,
	VVector3,
	VEnum,
 } from '../Types/index.js';
 
// main export
export default class AverageNode extends NWNode {

	// static properties for the class
	static nodeName = 'Average Number';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'values',
			title: 'Values', 
			description: "Add values to average",
			type: VNumber,
			isArray: true,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'count',
			title: 'Count', 
			description: "Total values being averaged",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'average',
			title: 'Average Result',
			description: "Average of input values",
			type: VNumber,
		});

		this.setEvalFunction((inputs) => {
			const raw = inputs.values;
			const arr = Array.isArray(raw) ? raw : (raw !== undefined && raw !== null ? [raw] : []);
			const count   = arr.length;
			const average = count > 0 ? arr.reduce((s, v) => s + (Number(v) || 0), 0) / count : 0;
			return { count, average };
		});
	}
	
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
