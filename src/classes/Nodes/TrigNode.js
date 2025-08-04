/*
	TrigNode.js
	-----------

	This will be a node that provides some basic trigonometric operations, in the form of sin(A), cos(A), tan(A), etc.
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
export default class TrigNode extends NWNode {

	// static properties for the class
	static nodeName = 'Trig Node';
	static icon = 'trig';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		// enumeration
		this.addField(FIELD_TYPE.PROP, { 
			name: 'operation',
			title: 'Trig Function',
			description: "Which trigonometric operation to perform",
			type: VEnum.With([
				'Sin',
				'Cos',
				'Tan',
				'Asin',
				'Acos',
				'Atan',				
			]),
		});

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'theta',
			title: 'Theta', 
			description: "Theta value for trigonometric operations",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'amplitude',
			title: 'Amplitude', 
			description: "Amplitude value for trigonometric operations",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'wavelength',
			title: 'Wave Length', 
			description: "Wave length value for trigonometric operations",
			type: VNumber,
		});	

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Function Value', 
			description: "Function Value",
			type: VNumber,
		});

	}

	/**
	 * Constructor
	 */
	constructor() {
		super();

		this.fieldState.amplitude.val = 1;
		this.fieldState.wavelength.val = 1;
	}

}
