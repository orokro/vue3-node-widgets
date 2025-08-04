/*
	RandomColorNode.js
	------------------

	This will be a node that provides a random color within a specified range.
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
export default class RandomColorNode extends NWNode {

	// static properties for the class
	static nodeName = 'Random Color';
	static icon = 'random-color';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'rMinMax',
			title: 'Red Min/Max', 
			description: "Red channel min and max values, in a Vector 2",
			type: VVector2,
		});	

		this.addField(FIELD_TYPE.INPUT, {
			name: 'gMinMax',
			title: 'Green Min/Max', 
			description: "Green channel min and max values, in a Vector 2",
			type: VVector2,
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'bMinMax',
			title: 'Blue Min/Max', 
			description: "Blue channel min and max values, in a Vector 2",
			type: VVector2,
		});

		this.addField(FIELD_TYPE.OUTPUT, { 
			name: 'result',
			title: 'Random Color', 
			description: "Random color generated from the specified ranges",
			type: VColor3,
		});
	}

	/**
	 * Constructor
	 */
	constructor() {
		super();

		this.fieldState.rMinMax.val = {x: 0, y: 1};
		this.fieldState.gMinMax.val = {x: 0, y: 1};
		this.fieldState.bMinMax.val = {x: 0, y: 1};
	}

}
