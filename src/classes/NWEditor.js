/*
	NWEditor.js
	-----------

	This file provides the main state class that we'll use for a NodeWidget editor.

	This can either be instantiated directly by the engineer and then provided to the NEWEditorGraph component via props,
	or otherwise a NWEditorGraph component will instantiate it's own NWEditor instance when it mounts.

	The NWEditor instance is the top-level state & logic class for the entire Node Widget system.
*/

// vue
import { ref, shallowRef, reactive, watch } from 'vue';

// our app
import NodeWidget from './NWNode';
import { VTypeRegistry } from './VTypeRegistry';
import { NWGraph } from './NWGraph';

// lib/misc
import DragHelper from 'gdraghelper';

// import default types
import {
	VNumber,
	VAngle,
	VInteger,
	VVector2,
	VVector3,
	VAngles,
	VColor3,
	VColor4,
	VBoolean,
	VText,
	VCharacter,
	VImage,
	VFile,
} from '@Types/index.js';

// import all default nodes
import { defaultNodeList } from '@Nodes/index.js';

// all defaults
const types = [
	VNumber, VAngle, VInteger, VVector2, VVector3,
	VAngles, VColor3, VColor4, VBoolean, VText, VCharacter,
	VImage, VFile,
];

// external libs/misc
import t from 'typical';

// main export class
export default class NWEditor {

	// make a unique id for this editor instance
	id = NWEditor.generateUUID('editor');

	// menu vars
	showMenu = ref(false);
	menuX = ref(0);
	menuY = ref(0);
	
	// reusable drag helper
	dragHelper = new DragHelper();

	// when we enter sub-graphs, we need to keep track of the parent editors
	parentGraphs = shallowRef([]);


	/**
	 * Constructor
	 *
	 *	@param {Object} options - Options for the editor.
	 *	@param {Array<NodeWidget|Object>} [options.nodesList] - An array of NodeWidget classes or objects with class and menuPath.
	 *	@param {VTypeRegistry} [options.typeRegistry] - An instance of VTypeRegistry to use for type management and coalescing.
	 *	@param {Object} [options.graphToLoad] - An object representing a graph to load into the editor.
	 *	@param {NWGraph} [options.graph] - An optional pre-built graph to use as the initial view.
	 *	@param {EditorState} [options.state] - Optional shared EditorState to delegate to.
	 *		When provided, this NWEditor becomes a per-window VIEW into the shared state:
	 *		typeRegistry and availableNodes delegate to state, while breadcrumbs and
	 *		current-graph navigation remain per-window. When NOT provided, legacy
	 *		standalone mode — NWEditor owns its own type registry, available-nodes list,
	 *		and root graph (current behavior, used by the dev app).
	 */
	constructor({nodesList, typeRegistry, graphToLoad, graph, state} = {}){

		// true once we have at least one available node
		this.isReady = ref(false);

		// IMPORTANT: set _state FIRST. The getters/setters for typeRegistry and
		// availableNodes (defined below) dispatch based on whether _state is truthy,
		// so any property assignment that follows needs this flag in place.
		this._state = state || null;

		if (this._state) {

			// SHARED-STATE MODE
			// -----------------
			// typeRegistry and availableNodes are read directly from state via
			// the getters defined below — we don't own copies. Per-window state
			// (current view, breadcrumbs, menu UI, drag helper) is still local.

			// Per-window "currently-shown" graph starts at the state's root graph.
			// Navigating into sub-graphs via openSubGraph() mutates this without
			// affecting the shared state's rootGraph.
			this.rootGraph = this._state.rootGraph;
			this.rootGraphRef = shallowRef(this.rootGraph);

			// We're "ready" as soon as the shared state has at least one available node.
			this.isReady.value = (this._state.availableNodes.value.length > 0);

			// When the EditorState's data is wholesale replaced (deserialize), our
			// breadcrumb stack and current-view reference may be pointing at
			// sub-graphs from the pre-deserialize tree. Watch the state's
			// deserializeVersion ref and reset navigation back to the (in-place
			// mutated) root when it bumps.
			this._deserializeWatcher = watch(
				() => this._state.deserializeVersion.value,
				() => {
					this.parentGraphs.value = [];
					this.rootGraph = this._state.rootGraph;
					this.rootGraphRef.value = this._state.rootGraph;
				}
			);

		} else {

			// LEGACY / STANDALONE MODE
			// ------------------------
			// Behavior matches pre-EditorState code exactly. The dev app uses this
			// path because <NWEditorGraph> still does `new NWEditor()` with no state.

			/*
				Our "graph" will consist of two separate arrays: nodes and wires.

				NODES:
				it's possible to instantiate nodes and have them placed, but not connected to anything
				so the list of instantiated nodes will be different than the actual graph of wires (see below)

				WIRES:
				wires will be classes that have things like type, and positions/handles for moving them around
				however, they will also be "logical" connections for evaluating the graph

				So, together we'll have a complete graph made out of these separate parts.
				NOTE: we will use shallowRefs for these, because they will be arrays of instantiated JS classes,
				and they will have their own Vue Refs and reactivity that we don't want to "unwrap"
			*/

			// own backing storage for the typeRegistry / availableNodes getters
			this._ownAvailableNodes = shallowRef([]);

			// use or build a default VTypeRegistry
			if(t.isDefined(typeRegistry) && t.isInstanceOf(typeRegistry, VTypeRegistry)){
				this._ownTypeRegistry = typeRegistry;
			}
			else {
				this._ownTypeRegistry = new VTypeRegistry(types);
			}

			this.rootGraph = graph ? graph : new NWGraph(this.typeRegistry);

			// dynamic version
			this.rootGraphRef = shallowRef(this.rootGraph);

			// if we were passed in a list of nodes, add them to our available nodes list
			if(t.isDefined(nodesList))
				this.addAvailableNodes(nodesList);
			else
				this.addAvailableNodes(defaultNodeList);

			// if we were passed in a graph to load, do so
			if(t.isDefined(graphToLoad))
				this.loadGraph(graphToLoad);
		}
	}


	/**
	 * The type registry. In shared-state mode, delegates to the EditorState's
	 * registry; in legacy mode, returns the locally-owned one.
	 */
	get typeRegistry() {
		return this._state ? this._state.typeRegistry : this._ownTypeRegistry;
	}
	set typeRegistry(value) {
		// In shared-state mode, the registry is owned by EditorState — silent no-op.
		if (this._state) return;
		this._ownTypeRegistry = value;
	}


	/**
	 * The available nodes list (shallowRef). In shared-state mode, delegates to
	 * the EditorState's list; in legacy mode, returns the locally-owned one.
	 */
	get availableNodes() {
		return this._state ? this._state.availableNodes : this._ownAvailableNodes;
	}
	set availableNodes(value) {
		// In shared-state mode, the list is owned by EditorState — silent no-op.
		if (this._state) return;
		this._ownAvailableNodes = value;
	}


	/**
	 * The shared EditorState if this NWEditor was constructed with one,
	 * otherwise null. Internal hook for component code that needs to
	 * distinguish per-window NWEditor from standalone instances.
	 */
	get state() {
		return this._state;
	}


	/**
	 * Lifecycle: stop watchers and release references. Called by
	 * <NWEditorGraph> on unmount. Safe to call multiple times.
	 */
	destroy() {
		if (this._deserializeWatcher) {
			this._deserializeWatcher();
			this._deserializeWatcher = null;
		}
	}


	/**
	 * Sets the root graph for the editor.
	 * 
	 * @param {NWGraph} newGraph - the new root graph to set
	 */
	setRootGraph(newGraph){
		
		// clear stack of parent graphs, since we're setting a new root
		this.parentGraphs.value = [];

		// set it
		this.rootGraph = newGraph;
		this.rootGraphRef.value = newGraph;
	}


	/**
	 * Opens a sub-graph in the editor.
	 * 
	 * @param {NWGraph} newSubGraph - the sub-graph to open
	 */
	openSubGraph(newSubGraph){

		// add the current graph to the parent editors stack
		this.parentGraphs.value = [
			...this.parentGraphs.value, 
			{
				id: this.constructor.generateUUID('parent'),
				graph: this.rootGraph,
			}
		];

		// set our graph but don't clear parents bc we're going deeper
		this.rootGraph = newSubGraph;
		this.rootGraphRef.value = newSubGraph;
	}


	/**
	 * Selects a breadcrumb in the editor.
	 * 
	 * @param {Number} index - the index of the breadcrumb to select
	 * @returns {void}
	 */
	selectBreadcrumb(index){

		// if they clicked the last one, do nothing
		if(index === this.parentGraphs.value.length)
			return;

		// otherwise, pop off the stack to the selected index
		const newParents = this.parentGraphs.value.slice(0, index);
		const selected = this.parentGraphs.value[index];

		// set our graph but don't clear parents bc we're going deeper
		this.rootGraph = selected.graph;
		this.rootGraphRef.value = selected.graph;

		// set the new parents array
		this.parentGraphs.value = newParents;
	}


	/**
	 * Public method to add one or more available Nodes to the editor.
	 *
	 * @param {NodeWidget|Object|Array<NodeWidget|Object>} nodesList - either a single NodeWidget class, or an object like {class: NodeWidget, menuPath: 'path/to/node/in/menu'}, or an array of these.
	 */
	addAvailableNodes(nodesList){

		// coalesce to an array
		if(!Array.isArray(nodesList))
			nodesList = [nodesList];

		// loop through the list & call our private method
		nodesList.forEach(nodeDetails => this.#addAvailableNode(nodeDetails));
	}


	/**
	 * Private method to add a single available Node to the editor.
	 *
	 * @param {NodeWidget|Object} nodeDetails - either a single NodeWidget class, or an object like {class: NodeWidget, menuPath: 'path/to/node/in/menu'}
	 */
	#addAvailableNode(nodeDetails){

		// if we were passed in a NodeWidget constructor class, just wrap it with default menu path & we out
		if(t.isClass(nodeDetails)){
			nodeDetails = {class: nodeDetails, menuPath: '/'};
			this.availableNodes.value = [...this.availableNodes.value, nodeDetails];
		}
		// otherwise, we were passed in an object with a class & menu path
		else {
			this.availableNodes.value = [...this.availableNodes.value, nodeDetails];
		}

		// this is true as soon as we have at least one available node
		this.isReady.value = (this.availableNodes.value.length > 0);
	}


	/**
	 * Load a graph into the editor.
	 *
	 * @param {String} graph - a JSON string representing a graph to load into the editor
	 * @returns {Boolean|Object} - true if the graph was loaded successfully, or an object with an error message if it failed.
	 */
	loadGraph(graph){

		return true;
	}


	/**
	 * Shows the menu to add a node at the specified position.
	 * 
	 * @param {Number} x - the x position to show the menu at
	 * @param {Number} y - the y position to show the menu at
	 */
	showAddNodeMenu(x, y){

		// set the menu position
		this.menuX.value = x-10;
		this.menuY.value = y-10;

		// show the menu
		this.showMenu.value = true;
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

}
