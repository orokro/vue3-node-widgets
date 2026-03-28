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
import { ref, shallowRef, reactive, nextTick, watch } from 'vue';

// our app
import { NWGraph } from '@/classes/NWGraph';
import { VTypeRegistry } from '@/classes/VTypeRegistry';
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

const types = [
	VNumber, VAngle, VInteger, VVector2, VVector3,
	VAngles, VColor3, VColor4, VBoolean, VText, VCharacter
];

import { 
	addBuildInNodesBatch01,
	addBuildInNodesBatch02,
	buildNaturalLayout01,
} from '@src/misc/BuildDefaultLayout';

// localStorage key for persisted graphs
const STORAGE_KEY = 'nw-dev-graphs-v1';

// main export
export class DevApp {

	/**
	 * Constructs a new DevApp instance.
	 */
	constructor(){

		// we'll need a type registry for our graphs
		this.typeRegistry = new VTypeRegistry(types);

		// array of graphs
		this.graphs = shallowRef([]);

		// we'll store our current graph here
		this.currentGraph = shallowRef(null);

		// save on page unload to catch field-value changes that don't trigger structural saves
		window.addEventListener('beforeunload', () => this.saveToStorage());

		// set up our default graphs (loads from storage or builds defaults)
		this.buildDefaults();
	}


	/**
	 * Adds a new graph to the app.
	 *
	 * Creates a new NWEditor instance if one is not provided.
	 * @param {NWGraph} graph - Optionally, provide an existing graph to add. If not provided, a new one will be created.
	 * @returns {NWGraph} The added or newly created graph.
	 */
	addGraph(graph){

		// if not provided, make new one
		if(!graph)
			graph = new NWGraph(this.typeRegistry);

		// if this is the first graph, also select it
		if(this.graphs.value.length === 0)
			this.currentGraph.value = graph;

		// add to list
		this.graphs.value = [...this.graphs.value, graph];

		// watch structural changes on this graph to auto-save
		watch([graph.nodes, graph.wires], () => this.saveToStorage());

		return graph;
	}


	/**
	 * Removes a graph from the app.
	 * Keeps at least one graph alive.
	 *
	 * @param {NWGraph} graph - The graph to delete.
	 */
	deleteGraph(graph){

		// always keep at least one graph
		if(this.graphs.value.length <= 1)
			return;

		const idx = this.graphs.value.indexOf(graph);
		if(idx === -1)
			return;

		// remove it
		this.graphs.value = this.graphs.value.filter(g => g !== graph);

		// if this was the current graph, select a neighbor
		if(this.currentGraph.value === graph){
			const newIdx = Math.max(0, idx - 1);
			this.currentGraph.value = this.graphs.value[newIdx];
		}

		this.saveToStorage();
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
	 * Builds some default graphs for testing purposes,
	 * unless localStorage already has saved graphs.
	 */
	async buildDefaults(){

		await nextTick();

		// restore from storage if available
		if(this.loadFromStorage())
			return;

		// make one first new app
		const nlGraph = new NWGraph(this.typeRegistry);
		buildNaturalLayout01(nlGraph);
		this.addGraph(nlGraph);

		// make a second one as well
		const batch01Graph = new NWGraph(this.typeRegistry);
		addBuildInNodesBatch01(batch01Graph);
		this.addGraph(batch01Graph);
	}


	/**
	 * Attempts to load graphs from localStorage.
	 *
	 * @returns {Boolean} true if at least one graph was restored, false otherwise.
	 */
	loadFromStorage(){

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if(!raw) return false;

			const data = JSON.parse(raw);
			if(!data?.graphs?.length) return false;

			data.graphs.forEach(graphData => {
				const graph = new NWGraph(this.typeRegistry);
				graph.deserialize(graphData);
				this.addGraph(graph);
			});

			// restore which graph was active
			if(typeof data.activeIndex === 'number'){
				const active = this.graphs.value[data.activeIndex];
				if(active) this.currentGraph.value = active;
			}

			return this.graphs.value.length > 0;

		} catch(e) {
			console.warn('DevApp: failed to load graphs from localStorage:', e);
			return false;
		}
	}


	/**
	 * Serializes all graphs and writes them to localStorage.
	 */
	saveToStorage(){

		try {
			const activeIndex = this.graphs.value.indexOf(this.currentGraph.value);
			const data = {
				activeIndex: activeIndex >= 0 ? activeIndex : 0,
				graphs: this.graphs.value.map(g => g.serialize()),
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch(e) {
			console.warn('DevApp: failed to save graphs to localStorage:', e);
		}
	}

}
