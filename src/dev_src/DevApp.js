/*
	DevApp.js
	---------

	While developing this plugin, it came to me that I needed a more sophisticated
	way to test the component's state, especially when used across multiple components
	and multiple graphs.

	This file, DevApp.js will manage the state for a simple app that uses the NWEditorGraph
	a long with the vue-win-mgr to create an app with multiple views of node graphs,
	as well as the ability to create and switch between multiple graphs.

	This file provides that class.
*/

// vue
import { ref, shallowRef, reactive, nextTick } from 'vue';

// our app
import NWEditor from '@Classes/NWEditor';
import { 
	addBuildInNodesBatch01,
	addBuildInNodesBatch02,
	buildNaturalLayout01,
} from '@src/misc/BuildDefaultLayout';

// main export
export class DevApp {

	/**
	 * Constructs a new DevApp instance.
	 */
	constructor(){

		// array of graphs
		this.graphs = shallowRef([]);

		// we'll store our current graph here
		this.currentGraph = shallowRef(null);

		// set up our default graphs
		this.buildDefaults();
	}


	/**
	 * Adds a new graph to the app.
	 * 
	 * Creates a new NWEditor instance if one is not provided.
	 * @param {NWEditor} graph - Optionally, provide an existing graph to add. If not provided, a new one will be created.
	 * @returns {NWEditor} The added or newly created graph.	
	 */
	addGraph(graph){

		// if not provided, make new one
		if(!graph)
			graph = new NWEditor();
		
		// if this is the first graph, also select it
		if(this.graphs.value.length === 0)
			this.currentGraph.value = graph;

		// add to list & return
		this.graphs.value = [...this.graphs.value, graph];
		return graph;
	}


	/**
	 * Selects a graph to be the current graph.
	 * 
	 * @param {NWEditor|Number} graph - The graph to select, or its index in the graphs array.
	 * @returns {void}
	 */
	selectGraph(graph){

		// if graph is a number, treat as index
		if(typeof graph === 'number')
			graph = this.graphs.value[graph];
		
		// make sure it's valid
		if(!graph || !this.graphs.value.includes(graph))
			return;

		// set as current
		this.currentGraph.value = graph;
	}


	/**
	 * Builds some default graphs for testing purposes.
	 */
	async buildDefaults(){

		await nextTick();
		
		// make one first new app
		const naturalLayoutCTX = new NWEditor();
		buildNaturalLayout01(naturalLayoutCTX);
		this.addGraph(naturalLayoutCTX);

		// make a second one as well
		const batch01CTX = new NWEditor();
		addBuildInNodesBatch01(batch01CTX);
		this.addGraph(batch01CTX);
	}

}
