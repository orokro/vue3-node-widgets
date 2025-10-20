/*
	NWEditor.js
	-----------

	This file provides the main state class that we'll use for a NodeWidget editor.

	This can either be instantiated directly by the engineer and then provided to the NEWEditorGraph component via props,
	or otherwise a NWEditorGraph component will instantiate it's own NWEditor instance when it mounts.

	The NWEditor instance is the top-level state & logic class for the entire Node Widget system.
*/

// vue
import { ref, shallowRef, reactive } from 'vue';

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
} from '@Types/index.js';

// import all default nodes
import { defaultNodeList } from '@Nodes/index.js';

// all defaults
const types = [
	VNumber, VAngle, VInteger, VVector2, VVector3,
	VAngles, VColor3, VColor4, VBoolean, VText, VCharacter
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
	 */
	constructor({nodesList, typeRegistry, graphToLoad, graph} = {}){

		// true once we have at least one available node
		this.isReady = ref(false);
		
		// our list of available nodes, as a shallow array
		this.availableNodes = shallowRef([]);

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
		this.rootGraph = graph ? graph : new NWGraph();

		// dynamic version
		this.rootGraphRef = shallowRef(this.rootGraph);

		// name for current graph
		this.graphName = ref('Root Graph');

		// whenever the user changes the graph, we can build a single functional "compute" function
		// that represents the entire graph, and can be called with inputs to get outputs
		// this function will be stored here
		// NOTE: this is a stub, and will be built later
		this.compiledComputeFN = ()=>{};

		// use or build a default VTypeRegistry
		if(t.isDefined(typeRegistry) && t.isInstanceOf(typeRegistry, VTypeRegistry)){
			this.typeRegistry = typeRegistry;
		}
		else {
			this.typeRegistry = new VTypeRegistry(types);
		}

		// if we were passed in a list of nodes, add them to our available nodes list
		if(t.isDefined(nodesList))
			this.addAvailableNodes(nodesList);
		else
			this.addAvailableNodes(defaultNodeList);

		// if we were passed in a graph to load, do so
		if(t.isDefined(graphToLoad))
			this.loadGraph(graphToLoad);
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
