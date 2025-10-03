/*
	GroupInputNode.js
	-----------------

	This is a special node that can only be added in sup-graphs (i.e. group node graphs).

	This will have some special dynamic outputs, that when wired to, will inform
	the group node to have matching inputs.
*/

import { nextTick } from 'vue';
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
export default class GroupInputNode extends NWNode {

	// static properties for the class
	static nodeName = 'Group Input';
	static icon = 'group';

	// so we can give unique names to fields
	static fieldCounter = 0;

	static {

		// reset things
		this.init();
		
		// this node should only be allowed in sub-graphs
		this.isSubGraphOnly = true;

		// This functions as an input-type node
		this.setNodeType(NODE_TYPE.INPUT);

		// label instructions
		this.addField(FIELD_TYPE.LABEL, { name: 'lbl', text: 'Add Inputs Below', align:'center' });
	}

	
	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);

		// this one is dynamic so we can re-order to the bottom as we add things
		this.anyField = this._addDynamicField(FIELD_TYPE.OUTPUT, {
			name: 'addOutput',
			title: 'Add Output',
			description: "Wire to add an output",
			type: VGroupAny,
		});
	}


	/**
	 * Called by the connection manager when a field's connection changes.
	 * 
	 * @param {Object} field - the field object whose connection changed
	 * @param {Connection} connection - the connection object that was added or removed
	 */
	onFieldConnect(field, connection){
		
		// get the type of the connected field
		let targetField = connection.getOtherField(field);
		let targetType = targetField.valueType;
		let targetName = targetField.name + (this.constructor.fieldCounter++);
		let targetTitle = targetField.title || targetField.name || 'Output';
		let targetDescription = targetField.description;

		// if we're the any field, let's re-wire it to a new dynamic input
		if(field === this.anyField){

			// create a new dynamic output field with this type
			let newField = this._addDynamicField(FIELD_TYPE.OUTPUT, {
				name: targetName,
				title: targetTitle,
				description: targetDescription,
				type: targetType,
			});

			// move the any field to the bottom
			this._moveDynamicFieldToEnd(this.anyField);

			// change the field on the connection to this new field
			connection.inputField = newField;
			connection.getNodeWireTickFn()();
			this.wiresVersion.value++;
		}

		// otherwise, if it's a connection involving one of our other fields, we need to ensure
		// that the group node has a matching input
		else {

			// update the field to match the connected type
			field.title = targetTitle;
			field.description = targetDescription;
			this._changeFieldType(field.id, targetType);

			// move the any field to the bottom
			this._moveDynamicFieldToEnd(this.anyField);

			connection.getNodeWireTickFn()();
			this.wiresVersion.value++;
		}

	}


	/**
	 * Called by the connection manager when a field's connection is removed.
	 * 
	 * @param {Object} field - the field object whose connection was removed
	 * @param {Connection} connection - the connection object that was removed
	 */
	onFieldDisconnect(field, connection){
		
		// only remove the field if it's not the any field
		if(field === this.anyField)
			return;
		
		// if there are still connections to this field, don't remove it
		const fieldConnections = connection.mgr.getConnectionsBySocket(this, field, false);
		
		// if there's more than one, don't remove it
		if(fieldConnections.length > 1)
			return;

		// if the connection remaining is not the one being removed, don't remove it
		if(fieldConnections.includes(field))
			return;

		nextTick(() => {
		
			// do the remove
			this._removeDynamicField(field.id);
			
			// do all our update stuff
			connection.getNodeWireTickFn()();
			connection.mgr.graph.updateIO();
			this.wiresVersion.value++;		
		});
	}

}
