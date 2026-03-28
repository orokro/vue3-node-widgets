/*
	ABMathKnobNode.js
	-----------------

	This is a version of the ABMathNode that will use our custom Knob component for inputting values.

	This exists solely to demonstrate how to create a node that uses a custom input component.

	This will be a node that provides some basic math operations, in the form of A - B, A + B, A * B, A / B, etc.
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
 
import KnobFieldWidget from '@/components/CustomDemos/KnobFieldWidget.vue';

// main export
export default class ABMathKnobNode extends NWNode {

	// static properties for the class
	static nodeName = 'AB Knob Math';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'aValue',
			title: 'A Value', 
			description: "A value for math operations",
			type: VNumber,
			component: KnobFieldWidget,
		});	
	
		// enumeration
		this.addField(FIELD_TYPE.PROP, { 
			name: 'operation',
			title: 'Operation',
			description: "Which A - B operation to perform",
			type: VEnum.With(['+', '-', '*', '/', '%', 'pow', 'log']),
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'bValue',
			title: 'B Value', 
			description: "B value for math operations",
			type: VNumber,
			component: KnobFieldWidget,
		});	

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'result',
			title: 'Result',
			description: "Result of A operation B",
			type: VNumber,
		});

		this.setEvalFunction((inputs) => {
			const a = inputs.aValue ?? 0;
			const b = inputs.bValue ?? 0;
			const op = inputs.operation ?? 0;
			let result;
			switch (op) {
				case 0:  result = a + b; break;
				case 1:  result = a - b; break;
				case 2:  result = a * b; break;
				case 3:  result = b !== 0 ? a / b : 0; break;
				case 4:  result = b !== 0 ? a % b : 0; break;
				case 5:  result = Math.pow(a, b); break;
				case 6:  result = a > 0 && b > 0 ? Math.log(a) / Math.log(b) : 0; break;
				default: result = 0;
			}
			return { result };
		});
	}
	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
