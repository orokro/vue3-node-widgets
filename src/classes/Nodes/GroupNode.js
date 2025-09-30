/*
	GroupNode.js
	------------

	This will be a node that has special functionality to group other nodes together.

	It will just store a NWGraph instance internally, and will provide a way to enter
	and exit the group (double-click to enter, breadcrumb to exit).

	When inside the group, the nodes will be rendered as normal, but there will be a special
	UI to allow exiting the group.

	Also, the NWGraph instance will be in sub-group mode, which means it cannot add input or output nodes,
	and it only can have special GroupInput nodes and GroupOutput nodes.

	Therefore, the fields of this node are dynamic based on the GroupInput and GroupOutput nodes
	of the internal graph.
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
	VEnum,
 } from '../Types/index.js';
 import { VType } from '../Types/index.js';

// main export
export default class GroupNode extends NWNode {

	// static properties for the class
	static nodeName = 'Group Node';
	static icon = 'group';

	static {

		// reset things
		this.init();
		
		// special group type
		this.setNodeType(NODE_TYPE.GROUP);

		// enumeration
		this.addField(FIELD_TYPE.PROP, { 
			name: 'groupName',
			title: 'Group Name',
			description: "Group Name",
			type: VText,
		});

		// the graph data
		this.addField(FIELD_TYPE.PROP, { 
			name: 'graph',
			title: 'graph',
			description: "The internal graph",
			type: VGraph,
		});
	}
	
	/**
	 * Constructor
	 */
	constructor() {
		super();

		this.fieldState.groupName.val = 'Group';

		this.addDynamicField(FIELD_TYPE.INPUT, {
			name: 'foo',
			title: 'Foo',
			type: VInteger,
		});

		this.addDynamicField(FIELD_TYPE.OUTPUT, {
			name: 'bar',
			title: 'Bar',
			type: VVector3,
		});
	}

}
