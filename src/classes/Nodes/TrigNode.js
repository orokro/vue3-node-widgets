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
	static nodeName = 'Trig';
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

		this.addField(FIELD_TYPE.PROP, { 
			name: 'degrees',
			title: 'Degrees', 
			description: "Use Degrees? If false, radians will be used",
			type: VBoolean,
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

		this.setEvalFunction((inputs) => {
			const op         = inputs.operation  ?? 0;
			const degrees    = inputs.degrees    ?? true;
			const amplitude  = inputs.amplitude  ?? 1;
			const wavelength = inputs.wavelength ?? 1;
			let theta = inputs.theta ?? 0;
			if (degrees) theta = theta * Math.PI / 180;
			theta = theta * wavelength;
			let raw;
			switch (op) {
				case 0:  raw = Math.sin(theta);  break;
				case 1:  raw = Math.cos(theta);  break;
				case 2:  raw = Math.tan(theta);  break;
				case 3:  raw = Math.asin(Math.max(-1, Math.min(1, theta))); break;
				case 4:  raw = Math.acos(Math.max(-1, Math.min(1, theta))); break;
				case 5:  raw = Math.atan(theta); break;
				default: raw = 0;
			}
			return { result: amplitude * raw };
		});
	}

	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);

		this.fieldState.degrees.val = true;
		this.fieldState.amplitude.val = 1;
		this.fieldState.wavelength.val = 1;
	}

}
