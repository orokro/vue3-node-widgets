/*
	SelectionManager.js
	-------------------

	Handles selection logic for nodes, including multi-selection with Shift/Ctrl keys.

	This will be per-graph, as each graph can have its own selection.
*/

// vue
import DragHelper from 'gdraghelper';
import { ref, shallowRef } from 'vue';
import NWNode from './NWNode';

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

		// the box selection rectangle (if any)
		this.isBoxSelecting = ref(false);
		this.boxX = ref(0);
		this.boxY = ref(0);
		this.boxWidth = ref(120);
		this.boxHeight = ref(80);

		// cache of node rects for hit testing during box selection
		this.nodeMap = {
			zoom: null,
			nodes: null,
		};
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
	 * Conditionally selects a node if it is not already selected.
	 * 
	 * @param {MouseEvent} event - the mouse event that triggered the selection
	 * @param {NWNode} node - the node to conditionally select
	 * @returns 
	 */
	conditionallySelectNode(event, node){

		// if already selected, do nothing
		if(this.selectedNodes.value.includes(node))
			return;
		

		// otherwise select it
		this.selectNode(event, node);
	}


	/**
	 * Helper to determine if there are more nodes selected than just the given one.
	 * 
	 * @param {NWNode} node - the node to check
	 * @returns 
	 */
	moreSelectedThanJust(node){

		// filter out the node & see if anything's left
		const others = this.selectedNodes.value.filter(n => n !== node);
		return others.length > 0 ? others : [];
	}


	/**
	 * Clears all selected nodes.
	 */
	selectNone(){
		
		// clear array
		this.selectedNodes.value = [];
	}


	/**
	 * Starts a drag selection operation.
	 * 
	 * @param {MouseEvent} event - The mouse event that triggered the drag selection.
	 * @param {Object} viewport - The viewport object containing pan and zoom information.
	 * @param {DragHelper} dragHelper - The DragHelper instance managing the drag operation.
	 */
	startDragSelect(event, viewport, dragHelper){

		// if shift is not held, clear selection
		if(!(event.shiftKey || event.ctrlKey || event.metaKey))
			this.selectNone();

		// save our initial selection to restore later if needed
		const initialSelection = [...this.selectedNodes.value];

		// save the node rects for hit testing
		this.cacheNodeRects(event, viewport);

		// set true while dragging
		this.isBoxSelecting.value = true;

		// set initial position
		const initialX = (event.offsetX - viewport.panX.value) / viewport.zoomScale.value;
		const initialY = (event.offsetY - viewport.panY.value) / viewport.zoomScale.value;

		// set initial pos
		this.boxX.value = initialX;
		this.boxY.value = initialY;

		// reset width to zero
		this.boxWidth.value = 0;
		this.boxHeight.value = 0;

		dragHelper.dragStart(

			// while dragging
			(dx, dy)=>{

				// get new position based on mouse current position
				const newX = (event.offsetX - dx - viewport.panX.value) / viewport.zoomScale.value;
				const newY = (event.offsetY - dy - viewport.panY.value) / viewport.zoomScale.value;

				// compute & set width/height
				const width = newX - initialX;
				const height = newY - initialY;
				this.boxWidth.value = Math.abs(width);
				this.boxHeight.value = Math.abs(height);

				// if dragging left/up, adjust the box position
				this.boxX.value = (width > 0) ? initialX : newX;
				this.boxY.value = (height > 0) ? initialY : newY;

				// get the nodes in the box, if any
				const idsInBox = this.getSelectionFromBox(viewport);
				const nodesInBox = this.graph.getNodesById(idsInBox);

				this.selectedNodes.value = [
					...initialSelection,
					...nodesInBox,
				];

			},

			// all done
			(dx, dy)=>{
				this.isBoxSelecting.value = false;
			}
		);
	}


	/**
	 * Caches the bounding rectangles of all nodes in the viewport for hit testing during box selection.
	 * 
	 * @param {MouseEvent} event - the mouse event
	 * @param {Object} viewport - the viewport object containing pan and zoom information
	 */
	cacheNodeRects(event, viewport) {

		// viewport DOM rect gives us its offset in window space
		const viewportRect = viewport.el.getBoundingClientRect();

		// get all node elements in the viewport
		const nodeEls = viewport.el.getElementsByClassName('node-instance');

		// get current zoom & pan
		const zoom = viewport.zoomScale.value;
		const panX = viewport.panX.value;
		const panY = viewport.panY.value;

		// build cache of node rects in viewport-local coordinates
		const cache = [];

		// for each node, get its bounding rect in viewport-local coordinates
		for (const el of nodeEls) {

			// get its ID & rect
			const id = el.getAttribute('data-node-id');
			const rect = el.getBoundingClientRect();

			// Convert from global window coordinates → viewport-local coordinates
			// Then normalize by zoom
			const localX = (rect.left - viewportRect.left - panX) / zoom;
			const localY = (rect.top - viewportRect.top - panY) / zoom;
			const localW = rect.width / zoom;
			const localH = rect.height / zoom;

			// add to cache
			cache.push({
				id,
				x: localX,
				y: localY,
				w: localW,
				h: localH,
			});

		}// next el

		this.nodeMap = {
			zoom,
			nodes: cache,
		};
	}


	/**
	 * Gets the list of selected node IDs based on the current box selection rectangle.
	 * 
	 * @param {Object} viewport - the viewport object containing pan and zoom information
	 * @returns {Array} - array of selected node IDs
	 */
	getSelectionFromBox(viewport) {

		// Rebuild map if zoom changed
		if (!this.nodeMap || this.nodeMap.zoom !== viewport.zoomScale.value) {
			this.cacheNodeRects(null, viewport);
		}
	
		const zoom = viewport.zoomScale.value;
		const box = {
			x: this.boxX.value,
			y: this.boxY.value,
			w: this.boxWidth.value,
			h: this.boxHeight.value,
			right: this.boxX.value + this.boxWidth.value,
			bottom: this.boxY.value + this.boxHeight.value,
		};
	
		const selected = [];
	
		for (const node of this.nodeMap.nodes) {
			const nodeRight = node.x + node.w;
			const nodeBottom = node.y + node.h;
	
			const overlaps = !(
				nodeRight < box.x ||
				node.x > box.right ||
				nodeBottom < box.y ||
				node.y > box.bottom
			);
	
			if (overlaps) {
				selected.push(node.id);
			}
		}
	
		return selected;
	}	

}
