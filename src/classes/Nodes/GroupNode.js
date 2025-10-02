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

// we'll always add input output nodes to the group node by default
import GroupInputNode from './GroupInputNode.js';
import GroupOutputNode from './GroupOutputNode.js';
import ABMathNode from './ABMathNode.js';
import { watchEffect } from 'vue';

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

		// build our built-in graph (which is just a default input & output node)
		this.buildDefaultLayout();

		// watch for IO changes in the internal graph & update our dynamic fields
		this.watchIO();

		// below was debug code for dynamic inputs
		return;
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


	/**
	 * Set up a watcher to monitor the internal graph's IO changes
	 */
	watchIO(){

		// automatically update our dynamic fields with the graph's IO changes
		this.ioWatcher = watchEffect(() => {

			// we'll start fresh by clearing our dynamic fields
			this.clearDynamicFields();

			// get our actual NWGraph instance for this node
			const ctx = this.fieldState.graph.val;

			/*
				The input/output definitions have the shape:
				
				{
					node: theNode,
					field: theField,
					type: theType,
					connected: true if a wire is connected
				}
			*/

			// get the inputs definitions
			const inputs = ctx.inputs.value;

			// iterate over them & add dynamic fields
			inputs.forEach( def => {

				// add a dynamic input field for this
				this.addDynamicField(FIELD_TYPE.INPUT, {
					name: def.field.name,
					title: def.field.title,
					type: def.type,
				});
			});

			// get the outputs definitions
			const outputs = ctx.outputs.value;

			// iterate over them & add dynamic fields
			outputs.forEach( def => {

				// add a dynamic output field for this
				this.addDynamicField(FIELD_TYPE.OUTPUT, {
					name: def.field.name,
					title: def.field.title,
					type: def.type,
				});
			});

		});
	}


	/**
	 * Build a default layout for the internal graph
	 */
	buildDefaultLayout(){

		// get the actual NWGraph instance for this node
		const ctx = this.fieldState.graph.val;

		// add both an input & output node by default
		ctx.addNode(GroupInputNode, 20, 200);
		ctx.addNode(GroupOutputNode, 680, 200);

		// for debug we'll also add a math node to the middle
		ctx.addNode(ABMathNode, 350, 200);
	}


	/**
	 * Called by the connection manager when a field's connection changes.
	 * 
	 * @param {Object} field - the field object whose connection changed
	 * @param {Connection} connection - the connection object that was added or removed
	 */
	onFieldConnect(field, connection){
		// console.log(`Field ${field.name} connection changed!`);
	}


	/**
	 * Called by the connection manager when a field's connection is removed.
	 * 
	 * @param {Object} field - the field object whose connection was removed
	 * @param {Connection} connection - the connection object that was removed
	 */
	onFieldDisconnect(field, connection){
		// console.log(`Field ${field.name} disconnected!`);
	}

}
