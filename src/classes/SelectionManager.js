/*
	SelectionManager.js
	-------------------

	Handles selection logic for nodes, including multi-selection with Shift/Ctrl keys.

	This will be per-graph, as each graph can have its own selection.
*/

// vue
import { ref, shallowRef } from 'vue';

// main export
export class SelectionManager {

	/**
	 * Constructs a new SelectionManager instance.
	 * 
	 * @param {NWGraph} graph - The graph that this selection manager belongs to.
	 */
	constructor(graph){

		// the graph this manager belongs to
		this.graph = graph;

		// the currently selected nodes
		this.selectedNodes = shallowRef([]);
	}


	/**
	 * Selects a node, with support for multi-selection using Shift/Ctrl keys.
	 * 
	 * @param {Event} event - The mouse event that triggered the selection.
	 * @param {NWNode} node - The node to select.
	 */
	selectNode(event, node){

		// log if shift is held
		const isMultiSelect = event.shiftKey || event.ctrlKey || event.metaKey;
		
		// if multi-selecting add it to the list
		if(isMultiSelect){

			this.selectedNodes.value = [...this.selectedNodes.value, node];
		
		}else{
			// single select, just set it
			this.selectedNodes.value = [node];
		}

	}


	/**
	 * Clears all selected nodes.
	 */
	selectNone(){
		
		// clear array
		this.selectedNodes.value = [];
	}

}
