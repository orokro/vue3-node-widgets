/*
	Connection.js
	-------------

	This will store the details of a connection between two nodes,
	in our connection manager.
*/

import { reactive, ref, shallowReactive } from "vue";
import { ConnectionManager } from "./ConnectionManager";
import NWNode, { SOCKET_TYPE } from "./NWNode";

export class Connection {

	/**
	 * Constructs a new Connection instance.
	 * 
	 * @param {ConnectionManager} mgr The connection manager that this connection belongs to.
	 */
	constructor(mgr){

		// generate unique ID
		this.id = 'wire_' + Math.random().toString(16).slice(2);

		// the connection manager
		this.mgr = mgr;

		/*
			NOTE on positions:

			Originally we stored positions purely in state & all was good.

			But, then I wanted to make it so we could have multiple components mount and share
			the same state data. This caused bugs with storing and updating positions.

			Below is a reactive versions of positions are manually set when wires are dragged.

			However, the actual code that render wires will compute positions if the nodes and fields are set.
			This means that if nodes/fields are set, the positions here are ignored.

			However, if the nodes/fields are cleared (like if a node is deleted or unplugged),
			then it will fall back to these values.

			However, they may have gotten out of sync, so we also store the last known positions
			in a non-reactive object, so if the nodes/fields are cleared,
			we can fall back to the last known positions.
		*/
		this.positions = reactive({

			// for bezier, the start and end points
			startX: 0,
			startY: 0,
			endX: 0,
			endY: 0,
		});

		// save last know positions (either computed, or stored), for when nodes/fields are cleared
		this.lastPositions = {
			startX: null,
			startY: null,
			endX: null,
			endY: null,
		};

		/*
			NOTE:
			naming convention might change later, but this may be counter intuitive:
			the input of the wire attaches to the output socket of a node.

			So inputNode/inputField refers to the node & field that is the output,
			where as outputNode/outputField refers to the node & field that is the input.
		*/

		// save the input node & field
		this.inputNode = null;
		this.inputField = null;

		// save the output node & field
		this.outputNode = null;
		this.outputField = null;

		// reactive versions
		this.ends = shallowReactive({
			inputNode: null,
			inputField: null,
			outputNode: null,
			outputField: null,
		});

		// true if being destroyed
		this.isBeingDestroyed = ref(false);
	}


	/**
	 * Sets the input for this connection.
	 * 
	 * @param {NWNode} node - the node that is the input for this connection.
	 * @param {Object} field - the field on the node that is the input for this connection.
	 */
	setInput(node, field){

		// tell the node before we kill stuffs
		if(node==null || field==null)
			this.inputNode?.onFieldDisconnect(this.inputField, this);

		// null defaults
		node = node || null;
		field = field || null;

		// save the input node & field
		this.inputNode = node;
		this.inputField = field;
		this.ends.inputNode = node;
		this.ends.inputField = field;

		// if it was nulled (cleared) then we can just GTFO now
		if(node === null || field === null){
			this.positions.startX = this.lastPositions.startX || this.positions.startX;
			this.positions.startY = this.lastPositions.startY || this.positions.startY;
			this.lastPositions.startX = null;
			this.lastPositions.startY = null;
			return;
		}	
	}


	/**
	 * Sets the output for this connection.
	 * 
	 * @param {NWNode} node - the node that is the output for this connection.
	 * @param {Object} field - the field on the node that is the output for this connection.
	 */
	setOutput(node, field){

		// tell the node before we kill stuffs
		if(node==null || field==null)
			this.outputNode?.onFieldDisconnect(this.outputField, this);

		// null defaults
		node = node || null;
		field = field || null;

		// save the output node & field
		this.outputNode = node;
		this.outputField = field;
		this.ends.outputNode = node;
		this.ends.outputField = field;

		// if it was nulled (cleared) then we can just GTFO now
		if(node === null || field === null){
			this.positions.endX = this.lastPositions.endX || this.positions.endX;
			this.positions.endY = this.lastPositions.endY || this.positions.endY;
			this.lastPositions.endX = null;
			this.lastPositions.endY = null;
			return;
		}
	}


	/**
	 * Helper to get the opposite field of a connection.
	 * 
	 * @param {Object} field - the field to get the opposite end of the connection for
	 * @returns {Object|null} - the opposite field, or null if not found
	 */
	getOtherField(field){
		if(field === this.inputField)
			return this.outputField;
		if(field === this.outputField)
			return this.inputField;
		return null;
	}


	/**
	 * Helper to get the opposite node of a connection.
	 * 
	 * @param {NWNode} node - the node to get the opposite end of the connection for
	 * @returns {NWNode|null} - the opposite node, or null if not found
	 */
	getOtherNode(node){
		if(node === this.inputNode)
			return this.outputNode;
		if(node === this.outputNode)
			return this.inputNode;
		return null;
	}
	

	/**
	 * Ticks the wire rendering versions of the input and output nodes.
	 */
	getNodeWireTickFn(){

		// cache the nodes
		const nodeA = this.inputNode;
		const nodeB = this.outputNode;

		// return a function that will tick the wire versions of both nodes
		return function(){
			if(nodeA)
				nodeA.wiresVersion.value++;
			if(nodeB)
				nodeB.wiresVersion.value++;
		};
	}


	/**
	 * Destroys this connection.
	 * 
	 * This will remove the connection from the connection manager
	 * and clean up any resources associated with it.
	 */
	destroy(){

		// set destroying to true to fade it out & then kill self
		this.isBeingDestroyed.value = true;

		// make sure our nodes update their wire versions
		const tickFn = this.getNodeWireTickFn();

		// clear input and output refs
		this.setInput(null, null);
		this.setOutput(null, null);

		// tick the nodes so they update their wire versions
		tickFn();
		
		// wait ab it & kill self
		setTimeout(() => {

			// am kil
			this.mgr.destroyConnection(this.id);

		}, 210);
	}

}
