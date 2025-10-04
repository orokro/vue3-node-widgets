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
import { nextTick, watch, watchEffect } from 'vue';
import ColorBlendNode from './ColorBlendNode.js';
import ColorMixNode from './ColorMixNode.js';

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
	constructor(...args) {
		super(...args);

		this.fieldState.groupName.val = 'Group';

		// build our built-in graph (which is just a default input & output node)
		this.buildDefaultLayout();

		// watch for IO changes in the internal graph & update our dynamic fields
		this.watchIO();

		// watch for our name to change to update the graph internally
		this.watchName();
	}


	/**
	 * Clean up
	 */
	destroy(){

		super.destroy();

		// stop our watchers
		if(this.ioWatcher)
			this.ioWatcher();
		if(this.nameWatcher)
			this.nameWatcher();
	}


	/**
	 * Set up a watcher to monitor the internal graph's IO changes
	 */
	watchIO(){

		// get our actual NWGraph instance for this node
		const ctx = this.fieldState.graph.val;

		// automatically update our dynamic fields with the graph's IO changes
		this.ioWatcher = watch([ctx.inputs, ctx.outputs], ([newInputs, newOutputs], [oldInputs, oldOutputs]) => {

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

			// first, remove any existing input fields that are no longer in the graph
			const dynamicInputFields = this.dynamicFields.filter(f => f.fieldType === FIELD_TYPE.INPUT);
			dynamicInputFields.forEach(f => {

				// check if we have any input definitions that match this field id
				const matchingInput = inputs.find(i => i.field.id === f.for);
				if(matchingInput == undefined)
					this._removeDynamicField(f.id);
			});

			// now add or update fields for each input
			inputs.forEach(i => {

				let existingField = this.dynamicFields.find(f => f.fieldType === FIELD_TYPE.INPUT && f.name === i.field.name);
				
				if(existingField){
					// update the type if it changed
					if(existingField.valueType.typeName !== i.type.typeName){
						existingField.title = i.field.title || i.field.name;
						existingField.description = i.field.description;
						this._changeFieldType(existingField.id, i.type);
					}
				}

				else {
					// add a new field
					this._addDynamicField(FIELD_TYPE.INPUT, {
						name: i.field.name,
						title: i.field.title || i.field.name,
						description: i.field.description,
						type: i.type,
						for: i.field.id,
					});
				}
			});

			// get the outputs definitions
			const outputs = ctx.outputs.value;

			// first, remove any existing output fields that are no longer in the graph
			const dynamicOutputFields = this.dynamicFields.filter(f => f.fieldType === FIELD_TYPE.OUTPUT);
			dynamicOutputFields.forEach(f => {

				// check if we have any output definitions that match this field id
				const matchingOutput = outputs.find(o => o.field.id === f.for);
				if(matchingOutput == undefined)
					this._removeDynamicField(f.id);
			});

			// now add or update fields for each output
			outputs.forEach(o => {
				
				let existingField = this.dynamicFields.find(f => f.fieldType === FIELD_TYPE.OUTPUT && f.name === o.field.name);
				
				if(existingField){
					// update the type if it changed
					if(existingField.valueType.typeName !== o.type.typeName){
						existingField.title = o.field.title || o.field.name;
						existingField.description = o.field.description;
						this._changeFieldType(existingField.id, o.type);
					}
				}
				else {

					// add a new field
					this._addDynamicField(FIELD_TYPE.OUTPUT, {
						name: o.field.name,
						title: o.field.title || o.field.name,
						description: o.field.description,
						type: o.type,
						for: o.field.id,
					});
				}
			});
			
			// update our list & triggers
			this.fieldsList.value = [
				...this.static.fields,
				...this.dynamicFields
			];
			this.wiresVersion.value++;
		});
	}


	/**
	 * Watch for changes to our name field and update the internal graph name
	 */
	watchName(){

		this.nameWatcher = watchEffect(() => {
			
			// get our actual NWGraph instance for this node
			const ctx = this.fieldState.graph.val;
			const newName = this.fieldState.groupName.valueRef.value;
			ctx.name.value = newName || 'Group';
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
		ctx.addNode(ABMathNode, 360, 200);
		ctx.addNode(ColorMixNode, 360, 460);
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
