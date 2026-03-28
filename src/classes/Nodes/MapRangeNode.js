/*
	MapRangeNode.js
	---------------

	This will be a node that provides a mapping from one range of values to another.
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
export default class MapRangeNode extends NWNode {

	// static properties for the class
	static nodeName = 'Map Range';
	static icon = 'map-range';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'Value',
			title: 'Input Value', 
			description: "Value to map from one range to another",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'fromMin',
			title: 'From Min', 
			description: "Minimum of the input range",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, {
			name: 'fromMax',
			title: 'From Max', 
			description: "Maximum of the input range",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'toMin',
			title: 'To Min', 
			description: "Minimum of the output range",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'toMax',
			title: 'To Max', 
			description: "Maximum of the output range",
			type: VNumber,
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'result',
			title: 'Mapped Value',
			description: "Mapped value from input range to output range",
			type: VNumber,
		});

		this.setEvalFunction((inputs) => {
			const v       = inputs.Value   ?? 0;
			const fromMin = inputs.fromMin ?? 0;
			const fromMax = inputs.fromMax ?? 1;
			const toMin   = inputs.toMin   ?? 0;
			const toMax   = inputs.toMax   ?? 100;
			const range   = fromMax - fromMin;
			if (range === 0) return { result: toMin };
			const t = (v - fromMin) / range;
			return { result: toMin + t * (toMax - toMin) };
		});
	}

	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);

		this.fieldState.fromMin.val = 0;
		this.fieldState.fromMax.val = 1;
		this.fieldState.toMin.val = 0;
		this.fieldState.toMax.val = 100;
	}

}
