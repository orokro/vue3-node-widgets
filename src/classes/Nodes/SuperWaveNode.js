/*
	SuperWaveNode.js
	----------------

	This will be a node specifically for demonstrating the ability to load a completely custom
	component to render it's UI.

	We will still define fields and logic, but the default field rendering will be bypassed
	for a custom Vue component that will handle all rendering and interaction.
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

 import SuperWaveNodeUI from '@/components/CustomDemos/SuperWaveNodeUI.vue';

// main export
export default class SuperWaveNode extends NWNode {

	// static properties for the class
	static nodeName = 'Super Wave Node';
	static icon = 'trig';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		// set our custom UI component
		this.setCustomComponent(SuperWaveNodeUI);

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

		this.addField(FIELD_TYPE.PROP, { 
			name: 'xOffset',
			title: 'xOffset', 
			description: "Screen Scroll Offset",
			type: VNumber,
			valuePassThrough: false,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'theta',
			title: 'Theta', 
			description: "Theta value for trigonometric operations",
			type: VNumber,
			valuePassThrough: false,
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
			valuePassThrough: false,
		});	

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'wavelength',
			title: 'Wave Length', 
			description: "Wave length value for trigonometric operations",
			type: VNumber,
			valuePassThrough: false,
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

		this.fieldState.degrees.val = true;
		this.fieldState.amplitude.val = 1;
		this.fieldState.wavelength.val = 1;
	}

}
