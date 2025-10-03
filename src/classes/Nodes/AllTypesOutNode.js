/*
	AllTypesOutNode.js
	------------------

	This will be a debug node so we can test all the various types
	we support of the box and make the sure the UI and all that works.

	Outputs Only
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
export default class AllTypesOutNode extends NWNode {

	// static properties for the class
	static nodeName = 'All Types (Out)';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		// add our fields

		// labels
		this.addField(FIELD_TYPE.LABEL, { name: 'lbl', text: 'All Types Node', align:'center' });
		// this.addField(FIELD_TYPE.LABEL, { text: 'Label B', align:'left' });
		// this.addField(FIELD_TYPE.LABEL, { text: 'Label 3', align:'right' });
		// this.addField(FIELD_TYPE.LABEL, { text: 'Label Next', align:'left' });

		// scalar numbers
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'numberInput',
			title: 'Positive Numbers', 
			description: "Tests numbers widget",
			align: 'left',
			type: VNumber,
			validateFn: (value) => {
				try {
					return parseFloat(value) >=0;
				}catch(e){
					return false
				}
			},
			lintFn: (value) => {
				try {
					value = parseFloat(value);
					return (value >= 0) ? value : 0; 
				}catch(e){
					return 0;
				}
			},
		});		
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'rangeInput',
			title: 'Ranged Numbers', 
			description: "Tests numbers widget",
			type: VNumber.Min(5).Max(20),
		});
		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'intInput',
			title: 'Int Number Test',
			description: "Tests integer widget, with positive only validation",
			type: VInteger,
		});

		// vectors
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'v2Input',
			title: 'Vector 2 Input',
			description: "Tests vector 2 widget",
			type: VVector2,
		});
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'v3Input',
			title: 'Vector 3 Input',
			description: "Tests vector 3 widget",
			type: VVector3,
		});

		// angles
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'angleInput',
			title: 'Angle Input',
			description: "Tests angle widget",
			type: VAngle,
			valuePassThrough: false,
		});
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'anglesInput',
			title: 'Angles Input',
			description: "Tests angles widget",
			type: VAngles,
		});

		// text inputs
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'textInput',
			title: 'Text Input',
			description: "Tests text widget",
			type: VText.Min(3).Max(10),
		});
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'characterInput',
			title: 'Character Input',
			description: "Tests character widget",
			type: VCharacter,
		});

		// boolean
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'booleanInput',
			title: 'Boolean Input',
			description: "Tests boolean widget",
			type: VBoolean.OffLabel('No').OnLabel('Yes'),
		});

		// colors
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'color3Input',
			title: 'Color 3 Input',
			description: "Tests color 3 widget",
			type: VColor3,
		});
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'color4Input',
			title: 'Color 4 Input',
			description: "Tests color 4 widget",
			type: VColor4,
		});

		// enumeration
		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'enumInput',
			title: 'Enum Input',
			description: "Tests enumeration widget",
			type: VEnum.With(['Option 1', 'Option 2', 'Option 3']),
		});

	}


	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	
		this.fieldState.rangeInput.val = 10;
	}

}
