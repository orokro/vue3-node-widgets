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
import DevErrors from './DevErrors';

// external libs/misc
import t from 'typical';

// main export class
export default class NWEditor {

	/**
	 * Constructor
	 *
	 * @param {Array<Constructor|Object>} nodesList - OPTIONAL; an array of NodeWidget node classes to be used in the editor, or an array of objects like {class: NodeClass, menuPath: 'path/to/node/in/menu'}
	 * @param {String} graphToLoad - OPTIONAL; a JSON string representing a graph to load into the editor
	 */
	constructor(nodesList, graphToLoad){

		// true once we have at least one available node
		this.isReady = ref(false);

		// make a new error tracking system, incase the developer using our library has errors turned on for debugging
		this.devErrors = new DevErrors(this);

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
		this.graph = {
			nodes: shallowRef([]),
			wires: shallowRef([]),
		};

		// whenever the user changes the graph, we can build a single functional "compute" function
		// that represents the entire graph, and can be called with inputs to get outputs
		// this function will be stored here
		this.compiledComputeFN = ()=>{};

		// if we were passed in a list of nodes, add them to our available nodes list
		if(t.isDefined(nodesList))
			this.addAvailableNodes(nodesList);

		// if we were passed in a graph to load, do so
		if(t.isDefined(graphToLoad))
			this.loadGraph(graphToLoad);
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

}
