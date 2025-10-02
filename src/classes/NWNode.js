/*
	NWNode.js
	---------

	This file provides the base class for all the different kinds of nodes that can be added to the NodeWidget editor.

	NOTE: we use NW prefix for the node widget system.
	So, this is "NWNode" or "Node Widget Node", lol.
	Each node class must extend this class and implement the necessary methods to define it's behavior.

	Developers can create their own node classes by extending this class and implementing the necessary methods.

	Instances of this class provide state for the Vue3 components, and can also (de)serialize themselves to/from JSON.

	The system will provide a menu to add nodes to the scene. Therefore, some static properties will be added
	to this class & the subclasses to define the node's name and icon, for instance.

	---------
	BUT ALSO:
	---------

	We will also handle the _logic_ of the node, which is the actual functionality of the node.
	For example, a "Math" node will have methods to perform addition, subtraction, etc.

	So, let's talk about how this works.

	There are many ways the user can evaluate the node graph, and we should support all of them.

	1. 	First, the user of the library can call getContext() on the graph component & with the context, say ctx.evaluate({inputs})
		In this case, the user provides _all_ the inputs (as specified by the graph). The if the graph is valid, and has an output node,
		correctly wired up, the output will be returned of the graph at this point.

		Note that this might not be fully deterministic - if the user built nodes that use:
			- Random numbers
			- Time-based values
			- API calls
		
		Calling evaluate with the same inputs will not necessarily yield the same outputs. However, if the system is designed to not
		use these features, then the output will be deterministic. I'll let the user decide how to build their nodes.

	2.  Next, is via events. If set up, the user can say ctx.on('output', (data) => { ... }) and the system will call this function.
		Then, if any inputs change (either via the user in using the UI, or via the system), the system will call this function
		with the new data. This is useful for real-time updates, and for the user to react to changes in the graph.

		Note that, we need to have a comprehensive input system, which I'll discuss later, but its also possible for the user to have
		their own state that is changing over time, and setting inputs to the graph, (not specific nodes, but the graph as a whole) and then
		the system will call the output function with the new data. This is useful for real-time updates, and for the user to react to changes
		in the graph.

		Of course, if the inputs change, but the output does not compute new values, the system will not call the output function.

	3. 	Lastly, manual traversal. In the first two examples, the logic of the nodes themselves do the "work" of computing a value for
		the graph. But perhaps the user wants to simply use the graph as a model for logic, and traverse the graph manually. Then,
		compile it into some other target like WASM, or GLSL, or even just JavaScript.

		In this case, the user can call ctx.getModel() and a JSON presentation of the graph will be returned. They can then
		traverse and transform the graph as they see fit, and then compile it into their target.

	Alright, with those three use cases, we need to discuss some other important aspects of the system.

	Inputs: inputs are somewhat complicated because there's three meanings. To clarify, I'll give an example of a use case.
	Suppose you're building a system wants to draw pixels on a <canvas> element. Your JavaScript code can handle getting the context,
	setting the pixel colors, and so fourth. But, you use this library to set up nodes to pick pixel colors for the canvas.

		1. 	graph inputs - these are types (using our types system), set on the graph system itself, and provide global inputs.
			so for example, the width of the canvas, the height of the canvas, the current X and Y position of the pixel being painted, etc.

			none of this concepts are provided by the library by default. If you want to expose the canvas width and height, that would
			be JavaScript logic outside te graph system, and you would set the inputs on the graph system itself.

			Also note that, if the canvas resizes, it would be up to the developer to update these input values in someway,
			so the graph can reevaluate the outputs, or at least be up-to-date with the new values.

		2.  input nodes - (not to be confused with node inputs, below). Input nodes are nodes that map the graph inputs to nodes that
			only have output connections.

			Consider the example we've just given, where the graph inputs are the canvas width and height.
			You could create a node called "Canvas Size" that has two outputs, one for width and one for height.
			Then, you can wire these outputs to other nodes that need the canvas size.

			Likewise, you could make a "Current Pixel" node that has two outputs, one for the current X position
			and one for the current Y position of the pixel being painted. This node would be wired to nodes that
			need the current pixel position.

			So, in this case, these are nodes that _only exist_ as a way to get the graph system inputs into the node graph,
			so the user can wire them up to other nodes that need these values.

		3.  node inputs - these are the inputs of a node itself, which are defined by the node class.

			For example, a "Math" node might have two inputs, one for the first number and one for the second number.
			The node class defines these inputs, and the user can wire them up to other nodes that provide the values.

			These inputs are not global, but rather specific to the node itself. They are defined by the node class,
			and can be wired up to other nodes that provide the values.

	Alright, with that info in mind, outputs are similar, so we'll be brief:

		1. 	graph outputs - these are the outputs of the graph system itself, and provide global outputs. These are whats 
			returned when the user calls ctx.evaluate({inputs}). These will be a list of all the types specified as outputs.

			Note that it's up to the user implementing the Output nodes (see below), to provide logic that writes to these
			outputs. Otherwise, wiring to an output node itself does not do anything.

			HOWEVER, the library can provide a default output node that simply provide input sockets for each of the named
			outputs. This might be less intuitive for non-dev users of the graph, but it is a good starting point.

		2.  output nodes - these are nodes that only have input sockets, are run to evaluate the graph, and provide outputs.

			Note that, there is the possible of ambiguity here, because it might be possible for the user to wire-up multiple
			outout nodes to the same output socket. In this case, system can either return the last evaluated value for each
			graph output, which is simple but might not be what the user expects.

			Or, the output can list each of the unique values that were written by the output during that graph evaluation,
			and the consumer of the graph can decide how to handle this.

		3.  node outputs - these are the outputs of a node itself, which are defined by the node class.
			For example, a "Math" node might have one output for the result of the addition operation.

			Note that, for most properties on a node, the input will also have an output socket that just copies its input value,
			so you can wire it straight through. While the inputs by default also provide the output socket, these aren't considered
			outputs of the node itself, but rather the graph inputs that carry forward.

			node outputs do not have an input socket on the left side of the node. They can only update their value by
			running the compute function the node provides.

	Okay, so now we understand the inputs and outputs of the system, let's talk about how nodes are evaluated.

	Nodes will be evaluated in a topological order, meaning that nodes will be evaluated in the order of their dependencies.

	Nodes will define a list of "fields" that are either inputs, outputs, or things like labels. This will be used to
	generate the "default" UI for the node in the editor, but also specify the inputs and outputs types and names.

	The node must also provide an evaluate() method that will be called when the node is evaluated, and it must work like this:

	({inputs})=>{

		return { outputs };	
	}

	the {inputs} object will contain all the keys of the named inputs of the node. Their types will be pre-validated and
	coalesced to the correct type, so the node can assume that the inputs are of the correct type.

	The outputs object should provide keys for all the named outputs, their values should be the correct type. If the fn
	omits a key, or provides the wrong type, the system will warn the developer. All node functions should return an object
	with all the outputs, even if they are empty.

	Note, that if the user is using the graph simply as a model for logic, and not using the evaluate() method,
	then we don't don't need to provide the evaluate() method. But if it is provided, it should provide the correct
	outputs as described above.

	-----------------------
	ON THE TOPIC OF FIELDS:
	-----------------------

	So, we will support the ability for developers to provide custom components to mount for the node's UI.

	In this case, we'll still render the title bar and the input/output sockets, but the rest of the node's body
	will be rendered using the custom component (Mounted with <component :is="node.customComponent" />).

	Now, there's a whole separate discussion to be had about how to handle the socket connections for custom components,
	but I'll leave that discussion for later. But the most common case will probably just to use the default UI
	of nodes.

	The UI works as follows: the node will have a list of rows that are rendered in the node's body.
	The rows will either be for:
		- label - just text strings - can provide any text the developer of the node desires, including properties like (align=left, etc)
		- input - provides socket on the left & right, requires a name, a kind (type), and a title, and optionally description for TTT.
		- output - provides socket ONLY on the right, requires a name, a kind (type), and a title, and optionally description for TTT.
		- prop - doesn't have sockets, but can show a UI widget to control node state, like a checkbox, a dropdown, etc.
		- custom - provides a custom component to render in the node's body. It will be provided a way to get nodes details.

	The inputs have the option to turn off their right socket, though this is not recommended, as it makes the node less useful.

	The node will render default UIs for each of it's types - the types will provide a component for their UI,
	that makes sense for it's type. For example, a draggable number box for numbers, a color picker for colors, etc.

	-----------------
	OVERALL WORKFLOW:
	-----------------

	- Developer will either define custom types & provide components to the types for rendering, or use the built-in defaults.
	- The types will be provided to the node system
	- Node will define a list of fields that use the types, and provide a title, description, and other properties.
	- Nodes can also define custom components to render it's rows
	- Nodes can provide an evaluate() method that will be called when the node is evaluated
	- Nodes can be input, output, or processing nodes
	- Nodes can be wired together to form a graph

	NOTE ON INPUTS & OUTPUTS:
	- Input nodes only have right-side sockets
	- Output nodes only have left-side sockets
	- Processing nodes have both left-side and right-side sockets, but right side sockets are optional for inputs.

*/

// vue
import { Value } from 'sass';
import { ref, shallowRef, watchEffect } from 'vue';

// the kind of nodes
export const NODE_TYPE = {
	UNSET: 'unset', 
	INPUT: 'input',
	OUTPUT: 'output',
	PROCESSING: 'processing',
	GROUP: 'group',
};

// the kinds of fields
export const FIELD_TYPE = {
	LABEL: 'label', // just a label, no input/output
	INPUT: 'input', // has both left & right sockets
	OUTPUT: 'output', // has only right socket
	PROP: 'prop', // has no sockets, but can show a UI widget to control node state
	CUSTOM: 'custom', // uses a custom component for rendering
};

// socket types
export const SOCKET_TYPE = {
	INPUT: 'input',
	OUTPUT: 'output',
};


// main export class
export default class NWNode {

	// static properties for the class
	static nodeName = 'unnamed node';
	static icon = null;

	// the type does not change, so it can staticly be set.
	static nodeType = NODE_TYPE.UNSET;

	// optional, a custom vue component constructor to render the node's body
	static customComponent = null;

	// as mentioned in the giant commend above, this will be the list of 'fields' for the component.
	// weather we use a custom component or not, these are required for the socket.
	static fields = [];

	// keep track of just inputs and outputs, by name
	static inputs = {};
	static outputs = {};
	
	// true when this node is only available in sub-graphs
	static isSubGraphOnly = false;

	// just a helpful shorthand
	static = this.constructor;

	// the id field of the node
	id = '';

	// dynamic fields added at runtime
	dynamicFields = [];

	// this will be a reactive list of both the static & dynamic fields as they're added/removed
	fieldsList = shallowRef([...this.static.fields, ...this.dynamicFields]);

	// version tick for reactive dependents (Node.vue, etc)
	// whenever a connection is plugged or unplugged from this node,
	// we'll increment this version to force updates of dependents
	wiresVersion = ref(0);

	// resets the static properties of the class for subclasses
	static init(){

		// set the node type to unset by default
		this.nodeType = NODE_TYPE.UNSET;

		// reset the fields
		this.fields = [];

		// reset the inputs and outputs maps
		this.inputs = {};
		this.outputs = {};

		// reset the eval function
		this.evalFn = null;
	}


	/**
	 * Sets the node type for this class.
	 * @param {string} nodeType - the type of node, one of NODE_TYPE constants
	 * @throws {Error} if the node type is already set or invalid
	 */
	static setNodeType(nodeType) {

		// error if we already have a node type set
		if (this.nodeType && this.nodeType !== NODE_TYPE.UNSET)
			throw new Error('Node type can only be set once');

		// validate the node type
		if (!Object.values(NODE_TYPE).includes(nodeType))
			throw new Error(`Invalid node type: ${nodeType}`);

		this.nodeType = nodeType;
	}


	/**
	 * Sets a custom Vue component to use for rendering the node's body.
	 * 
	 * @param {Function} component - a Vue component constructor to use for rendering the node's body
	 */
	static setCustomComponent(component) {

		// error if we already have a custom component set
		if (this.customComponent)
			throw new Error('Custom component can only be set once');

		// validate the component
		// if (typeof component !== 'object' && typeof component !== 'function')
		// 	throw new Error('Custom component must be a Vue component');

		// save the component
		this.customComponent = component;
	}


	/**
	 * Adds a field to our node.
	 * 
	 * @param {string} fieldType - the type of field to add, one of FIELD_TYPE constants
	 * @param {Object} options - the options for the field
	 */
	static addField(fieldType, options) {

		// error if we don't have a node type set yet
		if (!this.nodeType || this.nodeType === NODE_TYPE.UNSET)
			throw new Error('Node type must be set before adding fields');

		/*
			This next case might seem a bit counter-intuitive, at first.

			INPUT nodes can only have OUTPUT fields, because they are inputs to the graph.
			(Their values are set through coded on the graph component itself)

			OUTPUT nodes can only have INPUT fields, because they are outputs of the graph.
			So your nodes in the graph wire INTO the output node, therefore output nodes only have inputs.
		*/
		const { INPUT, OUTPUT, LABEL, PROP, CUSTOM } = FIELD_TYPE;
		
		if (this.nodeType === NODE_TYPE.INPUT && ![OUTPUT, LABEL, PROP, CUSTOM].includes(fieldType)) 
			throw new Error('Input nodes can only have output fields');

		if (this.nodeType === NODE_TYPE.OUTPUT && ![INPUT, LABEL, PROP, CUSTOM].includes(fieldType))
			throw new Error('Output nodes can only have input fields');
		
		// name is required for everything except labels and custom
		if (fieldType !== FIELD_TYPE.LABEL && fieldType !== CUSTOM && !options.name) 
			throw new Error('Field must provide a name');
		
		// custom nodes must provide a component to render
		if (fieldType === CUSTOM && !options.component)
			throw new Error('Custom field must provide a component to render');

		// not all options will be used for every type, but we'll provide all defaults here
		options = {
			name: '',
			text: '', // for labels only
			title: '', // line above the field
			description: '', // optional description for tooltip
			component: null,
			type: null,
			align: 'left', // default align is left
			validateFn: (value) => true, // default validation function always returns true
			lintFn: (value) => value, // default lint function always returns null (no errors)
			valuePassThrough: true, // shows socket on right for inputs
			...options,
		};

		// base object to mix in things
		// all fields will get these properties
		const baseField = {
			id: this.generateUUID('field'),
			fieldType,
			name: options.name,
			component: options.component,
		};

		// add specific props for each type
		switch(fieldType){

			case FIELD_TYPE.LABEL:
				
				this.fields.push({
					...baseField,
					text: options.text,
					align: options.align,
					title: options.title,
					align: options.align,
					description: options.description, 
				});
				break;

			case FIELD_TYPE.INPUT:

				// pack up the input field definition
				const inputDef = {
					...baseField,
					valueType: options.type,
					title: options.title,
					description: options.description,
					align: options.align,
					valuePassThrough: options.valuePassThrough,
					validateFn: options.validateFn,
					lintFn: options.lintFn,
				};
				
				// add to the fields array & inputs map
				this.fields.push(inputDef);
				this.inputs[options.name] = inputDef

				break;

			case FIELD_TYPE.OUTPUT:
				
				// pack up the output field definition
				const outputDef = {
					...baseField,
					valueType: options.type,
					title: options.title,
					description: options.description,
					align: options.align,
					validateFn: options.validateFn,
					lintFn: options.lintFn,
				};

				// add to the fields array & outputs map
				this.fields.push(outputDef);
				this.outputs[options.name] = outputDef;

				break;

			case FIELD_TYPE.CUSTOM:
				
				this.fields.push({
					...baseField,
					component: options.component,
				});
				break;

			case FIELD_TYPE.PROP:
				
				const propDef = {
					...baseField,
					valueType: options.type,
					title: options.title,
					description: options.description,
					align: options.align,
				};

				// add to the fields array & inputs map
				this.fields.push(propDef);

				// props don't have inputs or outputs
				// they're for widget use only

				break;

			default:
				throw new Error(`Unknown field type: ${fieldType}`);
		
		}// swatch
	}


	/**
	 * This method sets the evaluation function for the node, that does the work for the node
	 * 
	 * @param {Function} fn - a function that takes an object of inputs & returns an object of outputs.
	 */
	setEvalFunction(fn) {

		// error if we already have an eval function set
		if (this.evalFn)
			throw new Error('Eval function can only be set once');

		// validate the function
		if (typeof fn !== 'function')
			throw new Error('Eval function must be a function');

		// when the eval function runs, it must return an object with all the outputs
		// but the function is evaluated at run time (not presently in this static context),
		// so let's wrap it in a function that compares it's return with the keys in this.outputs
		// and if one is omitted, throw an error
		this.evalFn = (...args) => {

			// call the function with the args
			const result = fn(...args);

			// check if the result is an object
			if (typeof result !== 'object' || result === null)
				throw new Error('Eval function must return an object with outputs');

			// check if all outputs are present
			for (const outputName of Object.keys(this.outputs)) {
				if (!(outputName in result))
					throw new Error(`Eval function must return output: ${outputName}`);
			}

			return result;
		};

		// set the eval function
		this.evalFn = fn;
	}


	/**
	 * Generates a unique id for this node instance.
	 * 
	 * @param {String} prefix - optional prefix for the id
	 * @returns {String} - a unique id for this node instance
	 */
	static generateUUID(prefix='node') {
		
		// don't use the counter, use a random string
		return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
	}


	/**
	 * Constructor
	 */
	constructor() {

		// unique id for this node
		this.id = this.constructor.generateUUID();

		// position of the node in the graph
		this.x = ref(0);
		this.y = ref(0);

		// optional slug used for finding the node
		this.slug = '';

		// when we constructor a new instance of this node,
		// we need to init the state for all the fields
		this.fieldState = {};
		for (const field of this.static.fields) {

			if([FIELD_TYPE.INPUT, FIELD_TYPE.OUTPUT, FIELD_TYPE.PROP].includes(field.fieldType)) {
				
				this.fieldState[field.name] = this.wrapFieldValue(
					field.name, 
					field.id,
					new field.valueType()
				);
			}
		}
	}


	/**
	 * Wraps a field value so we can track changes to it.
	 * 
	 * @param {String} name - the name of the field to wrap
	 * @param {String} id - the id of the field to wrap
	 * @param {Value} value - the value to wrap
	 * @returns {Object} - object with get & set that has side effect of calling requestComputeUpdate()
	 */
	wrapFieldValue(name, id, value) {

		// create base object
		const wrapped = { 
			name,
			id,
			_valueObj: value,
			valueRef: shallowRef(value.value),
			data: {}
		};

		const node = this;

		// add our val w/ getter & setter + side effect
		Object.defineProperty(wrapped, 'val', {
			get() {
				return wrapped._valueObj.value;
			},
			set: (newValue) => {
				wrapped._valueObj.value = newValue;
				wrapped.valueRef.value = newValue;
				node.requestComputeUpdate(name, newValue);
			},
			enumerable: true,
			configurable: true
		});
		wrapped.watch = watchEffect(() => {
			wrapped._valueObj.value = wrapped.valueRef.value;
		});

		return wrapped;
	}


	/**
	 * When the user changes a value or we get a value from an upstream node,
	 * we will call this function to update the node's state.
	 * 
	 * @param {string} name - optional, name of the field triggering the update
	 * @param {any} value - optional, the value to set for the field
	 */
	requestComputeUpdate(name, value){

		// for now, just print
		if(false)
			console.log(`Requesting compute update for node "${this.id}", field "${name}" as`, value);
	}


	/**
	 * Sets the position of the node	
	 * @param {Number} x - horizontal position 
	 * @param {Number} y - vertical position
	 */
	setPosition(x, y) {

		// snap to units of 10
		x = Math.round(x / 10) * 10;
		y = Math.round(y / 10) * 10;

		// set the position of the node
		this.x.value = x;
		this.y.value = y;
	}


	/**
	 * Adds a dynamic field that isn't defined on the node type itself
	 * 
	 * @param {string} fieldType - either FIELD_TYPE.INPUT or FIELD_TYPE.OUTPUT
	 * @param {Object} options - options for the field:
	 * 		- name: string, required, name of the field
	 * 		- title: string, optional, title of the field
	 * 		- type: Value class, required, type of the field
	 * 		- description: string, optional, description of the field
	 */
	addDynamicField(fieldType, options) {
		
		const field = {
			id: this.static.generateUUID('field'),
			fieldType: fieldType,
			valueType: options.type,
			name: options.name,
			title: options.title || '',
			description: options.title || '',
			component: null,
			valuePassThrough: false,
			validateFn: (value) => true,
			lintFn: (value) => value,
		};

		// add to our list of dynamic fields
		this.dynamicFields.push(field);

		// create field state for this field
		if([FIELD_TYPE.INPUT, FIELD_TYPE.OUTPUT, FIELD_TYPE.PROP].includes(field.fieldType)) {
				
			this.fieldState[field.name] = this.wrapFieldValue(
				field.name, 
				field.id,
				new field.valueType()
			);
		}

		// update our fields list
		this.fieldsList.value = [...this.static.fields, ...this.dynamicFields];
	}


	/**
	 * Removes a dynamic field that was added at runtime.
	 * 
	 * @param {String} fieldID - the id of the field to remove
	 */
	removeDynamicField(fieldID) {

		// get the field definition for this ID
		const field = this.dynamicFields.find(f => f.id === fieldID);

		// filter out the field with the given id
		this.dynamicFields = this.dynamicFields.filter(f => f.id !== fieldID);

		// delete the field state that matches this field name
		if (field && field.name in this.fieldState) {
			delete this.fieldState[field.name];
		}

		// update our fields list
		this.fieldsList.value = [...this.static.fields, ...this.dynamicFields];
	}


	/**
	 * Clear all our dynamic fields
	 */
	clearDynamicFields(){

		// delete the field state for _just_ the dynamic fields
		for(const field of this.dynamicFields){
			if(field.name in this.fieldState){
				delete this.fieldState[field.name];
			}
		}// field

	}

}
