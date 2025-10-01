/*
	GroupOutputNode.js
	------------------

	This is a special node that can only be added in sub-graphs (i.e. group node graphs).

	This will have some special dynamic inputs, that when wired to, will inform
	the group node to have matching outputs.
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
	VGraph,
	VGroupAny,
	VEnum,
 } from '../Types/index.js';
 import { VType } from '../Types/index.js';

// main export
export default class GroupOutputNode extends NWNode {

	// static properties for the class
	static nodeName = 'Group Output';
	static icon = 'group';

	static {

		// reset things
		this.init();
		
		// This functions as an input-type node
		this.setNodeType(NODE_TYPE.OUTPUT);

		this.addField(FIELD_TYPE.LABEL, { name: 'lbl', text: 'Add Inputs Below', align:'center' });

		// enumeration
		this.addField(FIELD_TYPE.INPUT, { 
			name: 'addInput',
			title: 'Add Input',
			description: "Wire to add an input",
			type: VGroupAny,
		});

	}
	

	/**
	 * Constructor
	 */
	constructor() {

		super();

		// this node should only be allowed in sub-graphs
		this.isSubGraphOnly = true;

	}

}
