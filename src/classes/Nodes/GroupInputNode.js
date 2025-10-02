/*
	GroupInputNode.js
	-----------------

	This is a special node that can only be added in sup-graphs (i.e. group node graphs).

	This will have some special dynamic outputs, that when wired to, will inform
	the group node to have matching inputs.
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
export default class GroupInputNode extends NWNode {

	// static properties for the class
	static nodeName = 'Group Input';
	static icon = 'group';

	static {

		// reset things
		this.init();
		
		// this node should only be allowed in sub-graphs
		this.isSubGraphOnly = true;

		// This functions as an input-type node
		this.setNodeType(NODE_TYPE.INPUT);

		this.addField(FIELD_TYPE.LABEL, { name: 'lbl', text: 'Add Inputs Below', align:'center' });


	}

	
	/**
	 * Constructor
	 */
	constructor() {

		super();

		// our any type
		this.anyField = this.addDynamicField(FIELD_TYPE.OUTPUT, {
			name: 'addOutput',
			title: 'Add Output',
			description: "Wire to add an output",
			type: VGroupAny,
		});


		// this.fieldState.groupName.val = 'Group';
	}


	static fieldCounter = 0;

	/**
	 * Called by the connection manager when a field's connection changes.
	 * 
	 * @param {Object} field - the field object whose connection changed
	 * @param {Connection} connection - the connection object that was added or removed
	 */
	onFieldConnect(field, connection){
		
		// if we're the any field, let's re-wire it to a new dynamic input
		if(field === this.anyField){

			// get the type of the connected field
			let targetField = connection.getOtherField(field);
			let targetType = targetField.valueType;
			let targetName = targetField.name + (this.constructor.fieldCounter++);
			let targetTitle = targetField.title || targetField.name || 'Output';
			let targetDescription = targetField.description;

			// create a new dynamic output field with this type
			let newField = this.addDynamicField(FIELD_TYPE.OUTPUT, {
				name: targetName,
				title: targetTitle,
				description: targetDescription,
				type: targetType,
			});

			// move the any field to the bottom
			this.moveDynamicFieldToEnd(this.anyField);

			// change the field on the connection to this new field
			connection.inputField = newField;
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
		
		this.removeDynamicField(field.id);
		this.wiresVersion.value++;
	}

}
