/*
	AllTypesNode.js
	---------------

	This will be a debug node so we can test all the various types
	we support of the box and make the sure the UI and all that works.
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
 } from '../Types/index.js';
 
// main export
export default class AllTypesNode extends NWNode {

	// static properties for the class
	static nodeName = 'All Types';
	static icon = 'math';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		// add our fields
		this.addField(FIELD_TYPE.LABEL, { text: 'All Types Node', align:'center' });
		// this.addField(FIELD_TYPE.LABEL, { text: 'Label B', align:'left' });
		// this.addField(FIELD_TYPE.LABEL, { text: 'Label 3', align:'right' });
		// this.addField(FIELD_TYPE.LABEL, { text: 'Label Next', align:'left' });
		this.addField(FIELD_TYPE.INPUT, { 
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
		this.addField(FIELD_TYPE.INPUT, { 
			name: 'numberInput',
			title: 'Positive Numbers', 
			description: "Tests numbers widget",
			align: 'left',
			type: VNumber.Max(7),
		});
		this.addField(FIELD_TYPE.INPUT, {
			name: 'intInput',
			title: 'Int Number Test',
			description: "Tests integer widget, with positive only validation",
			align: 'left',
			type: VInteger,
		});
	}


	/**
	 * Constructor
	 */
	constructor() {
		super();
	}

}
