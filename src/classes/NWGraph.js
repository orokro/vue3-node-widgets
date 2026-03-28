/*
	NWGraph.js
	----------

	Historical note:
	Originally part of NWEditor.js, split out for clarity and separation of concerns.

	Basically, the list of wires (connections) and instantiated nodes (boxes) that make up the graph,
	were originally in a root object called graph, like { nodes: [], wires: [] }.

	But, if I want to be able to have node groups, it makes sense to store graphs as a more
	smaller atomic unit, so I can have a graph that contains nodes and wires, and then
	another graph that contains nodes and wires, and so on.

	Therefore, graphs will have their own connection manager,
	but they'll still share the same type registry and available nodes list.
*/

// vue
import { ref, shallowRef, reactive } from 'vue';

// our app
import { ConnectionManager } from './ConnectionManager';
import { SelectionManager } from './SelectionManager';

// external libs/misc
import t from 'typical';
import NWNode, { NODE_TYPE } from './NWNode';

// import all default nodes + the stable registry for serialization lookup
import { defaultNodeList, nodeClassRegistry } from './Nodes/index.js';

// main export
export class NWGraph {

	/**
	 * Constructs a new NWGraph instance.
	 *
	 * @param {VTypeRegistry} typeRegistry - The type registry to use for this graph.
	 * @param {Boolean} subGraph - Whether this graph is a subgraph (for node groups). Default is false.
	 */
	constructor(typeRegistry, subGraph = false) {

		// save the type registry
		this.typeRegistry = typeRegistry;

		// save whether this is a subgraph
		this.subGraph = subGraph;

		// our dynamic name
		this.name = ref('Root Graph');

		// our list of instantiated nodes and connections
		this.nodes = shallowRef([]);
		this.wires = shallowRef([]);

		// when the user adds input and output nodes, we'll compute the inputs and outputs
		// for the entire graph
		this.inputs = shallowRef([]);
		this.outputs = shallowRef([]);

		// make new manager for our connections in this graph specifically
		// (previously we had a global one in NWEditor, but this makes more sense for node groups)
		this.connMgr = new ConnectionManager(this);

		// make new selection manager for this graph specifically
		this.selMgr = new SelectionManager(this);
	}


	/**
	 * Selects a node in the graph.
	 *
	 * @param {NWNode} node - The node to select.
	 */
	selectNode(node){
		console.log('selectNode not implemented yet', node);
	}


	/**
	 * Adds a node to our graph at the specified position.
	 *
	 * @param {Function} nodeClass - The class of the node to add.
	 * @param {Number} x - The x position to add the node at.
	 * @param {Number} y - The y position to add the node at.
	 * @param {String|null} slug - An optional slug to assign to the node.
	 * @returns {NWNode} - The newly created node.
	 */
	addNode(nodeClass, x = 0, y = 0, slug = null) {

		let newNode = null;

		// if we were passed in a class, instantiate it
		if (t.isClass(nodeClass)) {
			newNode = new nodeClass(this);
			// stamp the stable serialization key if this class is in the registry
			const regEntry = nodeClassRegistry.get(nodeClass.name);
			if (regEntry?.key) newNode._serializeKey = regEntry.key;
		}

		// if we were passed in an object with {class, key?, menuPath}, instantiate it
		else if (t.isObject(nodeClass) && t.isDefined(nodeClass.class)) {
			newNode = new nodeClass.class(this);
			// prefer the explicit key on the entry, fall back to registry lookup
			const key = nodeClass.key || nodeClassRegistry.get(nodeClass.class.name)?.key;
			if (key) newNode._serializeKey = key;
		}

		// set the position of the node
		newNode.setPosition(x, y);

		// if we got a slug
		if (t.isDefined(slug) && t.isString(slug)) {
			newNode.slug = slug;
		}

		// add the node to our graph
		this.nodes.value = [...this.nodes.value, newNode];

		// re-evaluate our IO (if this is a group node, it may have changed)
		this.updateIO();

		return newNode;
	}


	/**
	 * Finds a node by its slug.
	 *
	 * @param {String} slug - The slug of the node to find.
	 * @returns {NWNode|null} - The node with the specified slug, or null if not found.
	 */
	findNodeBySlug(slug) {

		// if we were passed in a slug, find the node by slug
		if (t.isDefined(slug) && t.isString(slug)) {
			return this.nodes.value.find(n => n.slug === slug);
		}

		// if we weren't passed in a slug, return null
		return null;
	}


	/**
	 * Gets nodes by their ID(s).
	 *
	 * @param {string|string[]} nodeID - The node ID or array of node IDs to get.
	 * @returns {NWNode|NWNode[]|null} - The node(s) with the specified ID(s), or null if not found.
	 */
	getNodesById(nodeID) {

		// if we were passed in a single ID, return the node with that ID
		if (t.isDefined(nodeID) && t.isString(nodeID)) {
			return this.nodes.value.find(n => n.id === nodeID) || null;
		}

		// if we were passed in an array of IDs, return the nodes with those IDs
		else if (t.isDefined(nodeID) && Array.isArray(nodeID)) {
			return this.nodes.value.filter(n => nodeID.includes(n.id));
		}

		// if we weren't passed in anything, return null
		return null;
	}


	/**
	 * Helper to get all nodes of a specific kind.
	 *
	 * @param {string} kind - one of the NODE_TYPE values
	 * @returns {NWNode[]} - An array of nodes of the specified kind.
	 */
	getNodesByKind(kind) {

		// default case
		if (!t.isDefined(kind) || !t.isString(kind))
			return [];

		return this.nodes.value.filter(n => n.constructor.nodeType === kind);
	}


	/**
	 * Removes a node from the graph.
	 * @param {*} nodeOrNodeID - The node or node ID to remove.
	 * @returns {Boolean} - True if the node was removed, false otherwise.
	 */
	removeNode(nodeOrNodeID) {

		// find the node by id or reference
		const node = t.isDefined(nodeOrNodeID) ? this.nodes.value.find(n => n.id === nodeOrNodeID || n === nodeOrNodeID) : null;

		// if we found the node, remove it
		if (node) {

			// delete the node
			this.nodes.value = this.nodes.value.filter(n => n !== node);

			// tell it to clean up
			node.destroy();

			// break any connections this node may have & update io
			this.connMgr.breakConnectionsByNode(node);
			this.updateIO();

			return true;
		}

		// if we didn't find the node, return false
		return false;
	}


	/**
	 * Returns the nodes in topological order (producers before consumers).
	 *
	 * Uses a DFS that visits upstream dependencies before the current node,
	 * so the result is already in execution order with no reverse needed.
	 *
	 * ConnectionManager naming reminder:
	 *   conn.inputNode  = PRODUCER  (the node whose output is being consumed)
	 *   conn.outputNode = CONSUMER  (the node whose input receives the value)
	 *
	 * @returns {NWNode[]} - the nodes in topological (execution) order
	 */
	getTopologicalOrder() {
		const nodes = this.nodes.value;
		const order = [];
		const visited = new Set();
		const visiting = new Set();

		const visit = (node) => {
			if (visiting.has(node.id)) {
				throw new Error('Cycle detected in graph');
			}
			if (!visited.has(node.id)) {
				visiting.add(node.id);

				// Visit all upstream dependencies first.
				// Upstream connections are those where THIS node is the CONSUMER
				// (conn.outputNode === node), and the producer is conn.inputNode.
				const upstreamConnections = this.connMgr.wires.value.filter(
					conn => conn.outputNode === node
				);
				upstreamConnections.forEach(conn => {
					if (conn.inputNode) visit(conn.inputNode);
				});

				visiting.delete(node.id);
				visited.add(node.id);
				order.push(node); // pushed AFTER all dependencies → correct execution order
			}
		};

		nodes.forEach(node => visit(node));

		// No reverse needed: dependencies are added before their dependents.
		return order;
	}


	/**
	 * Evaluates the entire graph.
	 *
	 * @param {Object} inputs - the global inputs for the graph
	 * @returns {Object} - the global outputs of the graph
	 */
	evaluate(inputs = {}) {

		// 1. Set global inputs on the graph's input nodes
		const inputNodes = this.getNodesByKind(NODE_TYPE.INPUT);
		inputNodes.forEach(node => {
			for (const key in node.fieldState) {
				if (inputs[key] !== undefined) {
					node.fieldState[key].val = inputs[key];
				}
			}
		});

		// 2. Get topological order
		const order = this.getTopologicalOrder();

		// 3. Evaluate each node in order
		order.forEach(node => {

			// A: Pull values from upstream connections before evaluating
			node.fieldsList.value.forEach(field => {
				if (field.fieldType === 'input') {
					const connections = this.connMgr.getConnectionsBySocket(node, field);
					if (connections.length > 0) {
						// For now, take the first connection.
						// (Array sockets would need different logic here)
						const conn = connections[0];
						if (conn.outputNode && conn.outputField) {
							const upstreamVal = conn.outputNode.fieldState[conn.outputField.name].val;

							// If there's a coalescer, we should use it!
							// conn.coalescer is available if types matched via registry.
							let finalVal = upstreamVal;
							if (conn.coalescer) {
								finalVal = conn.coalescer(upstreamVal);
							}

							node.fieldState[field.name].val = finalVal;
						}
					}
				}
			});

			// B: Actually evaluate the node
			node.evaluate();
		});

		// 4. Collect results from output nodes
		const results = {};
		const outputNodes = this.getNodesByKind(NODE_TYPE.OUTPUT);
		outputNodes.forEach(node => {
			for (const key in node.fieldState) {
				results[key] = node.fieldState[key].val;
			}
		});

		return results;
	}


	/**
	 * Compiles the graph into a pure, stateless closure for per-pixel evaluation.
	 *
	 * The returned function takes a context object:
	 *   { x, y, width, height, mouseX, mouseY }
	 * and returns a Color3 value: { r, g, b } in the 0–1 range.
	 *
	 * This is the engine for the Node Bucket canvas harness.
	 * All graph state is snapshotted at compile time; the returned closure
	 * does NOT mutate any live node field state.
	 *
	 * @returns {Function|null} - compiled pixel function, or null if graph is invalid
	 */
	getComputeFunction() {

		// 1. Compile-time topological order
		let order;
		try {
			order = this.getTopologicalOrder();
		} catch (e) {
			console.error('getComputeFunction: cycle detected', e);
			return null;
		}

		// 2. Find the OutputColor node (first OUTPUT node with an outColor field)
		const outputNode = order.find(n =>
			n.constructor.nodeType === NODE_TYPE.OUTPUT &&
			n.fieldState['outColor'] !== undefined
		);
		if (!outputNode) {
			console.warn('getComputeFunction: no OutputColor node found in graph');
			return null;
		}

		// 3. Snapshot wired connections at compile time.
		//    Map<consumerId, Map<consumerFieldName, { srcNodeId, srcFieldName, convert? }>>
		//    Consumer = outputNode side; Producer = inputNode side (counter-intuitive naming).
		//
		//    If the source and destination field types differ, we bake a compile-time
		//    raw-value converter using the type registry so the hot loop never has to
		//    do type lookups.  The converter wraps the raw value in a VType instance,
		//    runs the registered (possibly composed) coalescer, and returns the inner
		//    raw value of the result.
		const wirings = new Map();
		this.connMgr.wires.value.forEach(conn => {
			if (!conn.outputNode || !conn.outputField || !conn.inputNode || !conn.inputField) return;
			const cId = conn.outputNode.id;
			if (!wirings.has(cId)) wirings.set(cId, new Map());

			// Build a raw-value type converter if src and dst field types differ
			const srcType = conn.inputField.valueType;
			const dstType = conn.outputField.valueType;
			const srcBase = srcType?.baseType || srcType;
			const dstBase = dstType?.baseType || dstType;
			let convert = null;
			if (srcBase && dstBase && srcBase !== dstBase) {
				const coalescer = this.typeRegistry?.getCoalescer(srcBase, dstBase);
				if (coalescer) {
					convert = (rawVal) => {
						const result = coalescer.apply(new srcBase(rawVal));
						return result?.value ?? result;
					};
				}
			}

			wirings.get(cId).set(conn.outputField.name, {
				srcNodeId:    conn.inputNode.id,
				srcFieldName: conn.inputField.name,
				convert,
			});
		});

		// 4. Snapshot current field values (non-wired defaults + prop values)
		const staticValues = new Map();
		order.forEach(node => {
			const snap = {};
			node.fieldsList.value.forEach(field => {
				if (field.name) snap[field.name] = node.fieldState[field.name]?.val;
			});
			staticValues.set(node.id, snap);
		});

		// 5. Gather per-node eval data (compile-time references, no live state)
		const nodeEvalData = order.map(node => ({
			id: node.id,
			evalFn: node.constructor.evalFn || null,
			// Only INPUT nodes are allowed to receive the canvas context (x, y, width, height).
			// PROCESSING nodes must be purely functional and context-agnostic.
			isInputNode: node.constructor.nodeType === NODE_TYPE.INPUT,
			// The names of fields that should be passed as inputs to evalFn
			inputFields: node.fieldsList.value
				.filter(f => f.fieldType === 'input' || f.fieldType === 'prop')
				.map(f => f.name),
		}));

		const outputNodeId = outputNode.id;

		// 6. Return the compiled per-pixel closure
		return (context) => {

			// Fresh local state for this evaluation pass — never touches live fieldState
			const state = new Map();
			for (const [nodeId, snap] of staticValues) {
				state.set(nodeId, { ...snap });
			}

			for (const evalData of nodeEvalData) {
				const nodeState = state.get(evalData.id);

				// Pull upstream wired values into this node's local state,
				// applying any compile-time type coalescer if types don't match.
				const nodeWirings = wirings.get(evalData.id);
				if (nodeWirings) {
					for (const [fieldName, src] of nodeWirings) {
						const srcState = state.get(src.srcNodeId);
						if (srcState) {
							let val = srcState[src.srcFieldName];
							if (src.convert) val = src.convert(val);
							nodeState[fieldName] = val;
						}
					}
				}

				// Run the node's eval function if present
				if (evalData.evalFn) {
					const inputs = {};
					for (const fname of evalData.inputFields) {
						inputs[fname] = nodeState[fname];
					}
					try {
						const outputs = evalData.evalFn(inputs, evalData.isInputNode ? context : undefined);
						if (outputs && typeof outputs === 'object') {
							for (const [k, v] of Object.entries(outputs)) {
								nodeState[k] = v;
							}
						}
					} catch (_e) {
						// Swallow per-pixel eval errors silently
					}
				}
			}

			// Return the final output color
			return state.get(outputNodeId)?.['outColor'] ?? { r: 0, g: 0, b: 0 };
		};
	}


	/**
	 * Updates the input and output nodes of the graph.
	 */
	updateIO(){

		// get a list of all the input nodes currently in the graph
		const inputNodes = this.getNodesByKind(NODE_TYPE.INPUT);
		const outputNodes = this.getNodesByKind(NODE_TYPE.OUTPUT);

		/*
			Now we want to rebuild these
			this.inputs = shallowRef([]);
			this.outputs = shallowRef([]);

			We'll iterate over the input & output nodes & make data in the shape:

			{
				node: theNode,
				field: theField,
				type: theType,
				connected: true if a wire is connected
			}

			We can use the connection managers getConnectionsBySocket to
			check if a wire is connected to this field.
		*/

		const newInputsList = [];
		inputNodes.forEach(node => {
			node.fieldsList.value.forEach(field => {
				if (field.fieldType === 'output') {

					// skip the VGroupAny type, since it's just a placeholder
					if (field.valueType && field.valueType.typeName === 'Group Any')
						return;

					const connections = this.connMgr.getConnectionsBySocket(node, field, false);

					newInputsList.push({
						node: node,
						field: field,
						type: field.valueType,
						connected: connections.length > 0
					});
				}
			});
		});

		const newOutputsList = [];
		outputNodes.forEach(node => {
			node.fieldsList.value.forEach(field => {
				if (field.fieldType === 'input') {

					// skip the VGroupAny type, since it's just a placeholder
					if (field.valueType && field.valueType.typeName === 'Group Any')
						return;

					const connections = this.connMgr.getConnectionsBySocket(node, field);

					newOutputsList.push({
						node: node,
						field: field,
						type: field.valueType,
						connected: connections.length > 0
					});
				}
			});
		});

		// update our state with the new lists
		this.inputs.value = newInputsList;
		this.outputs.value = newOutputsList;
	}


	/**
	 * Serializes this graph to a JSON object.
	 */
	serialize(){

		return {
			name: this.name.value,
			subGraph: this.subGraph,
			nodes: this.nodes.value.map(n => n.serialize()),
			wires: this.wires.value.map(w => w.serialize()),
		};
	}


	/**
	 * Deserializes a JSON object into this graph instance.
	 *
	 * @param {Object} data - the JSON object to deserialize
	 */
	deserialize(data){

		this.name.value = data.name || 'Root Graph';
		this.subGraph = data.subGraph || false;

		// 1. Clear current state
		this.nodes.value = [];
		this.wires.value = [];

		// 2. Instantiate nodes
		// Look up by serializeKey first (production-safe), then fall back to class name.
		const nodeMap = new Map();
		if(data.nodes){
			data.nodes.forEach(nodeData => {

				const lookupKey = nodeData.serializeKey || nodeData.class;
				const nodeDetails = nodeClassRegistry.get(lookupKey);

				if(nodeDetails){
					const newNode = new nodeDetails.class(this);
					// restore the stable key on the new instance
					if (nodeDetails.key) newNode._serializeKey = nodeDetails.key;
					newNode.deserialize(nodeData);
					this.nodes.value = [...this.nodes.value, newNode];
					nodeMap.set(newNode.id, newNode);
				} else {
					console.warn(`Could not find node class for key: "${lookupKey}"`);
				}
			});
		}

		// 3. Instantiate wires and link them
		if(data.wires){
			data.wires.forEach(wireData => {

				const conn = this.connMgr.addConnectionBasic();
				conn.deserialize(wireData);

				const inputNode = nodeMap.get(wireData.inputNodeId);
				const outputNode = nodeMap.get(wireData.outputNodeId);

				if(inputNode && outputNode){
					// find fields by name (stable across reloads), fall back to ID for older saves
					const inputField = inputNode.fieldsList.value.find(f =>
						(wireData.inputFieldName && f.name === wireData.inputFieldName) ||
						f.id === wireData.inputFieldId
					);
					const outputField = outputNode.fieldsList.value.find(f =>
						(wireData.outputFieldName && f.name === wireData.outputFieldName) ||
						f.id === wireData.outputFieldId
					);

					if(inputField && outputField){
						conn.setInput(inputNode, inputField);
						conn.setOutput(outputNode, outputField);
					} else {
						console.warn(`Could not find fields for wire: ${wireData.id}`);
						conn.destroy();
					}
				} else {
					console.warn(`Could not find nodes for wire: ${wireData.id}`);
					conn.destroy();
				}
			});
		}

		this.updateIO();
		return this;
	}

}
