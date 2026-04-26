<!--
	NodeGraphRenderer.vue
	---------------------

	This component renders nodes & wires connecting them on a scrollable, zoomable grid.

	This was originally the responsibly of the NWEditorGraph.vue component,
	but I decided to split it out so we could handle sub-graphs more easily.

	The NWEditorGraph will essentially act as a mount point & state for system,
	but actual wires/nodes rendering will be handled by this component.
-->
<template>

	<!-- this is the actual scrollable area where nodes, wires, etc appear and are editable. This clips/clamps overflow -->
	<div
		ref="containerEl"
		class="editor-container fill-parent"
		:tabindex="0"
		:tabstop="0"
		@mousedown.self="startDragOperation"
		@mousedown="maybeStartRazor"
		@click.right.self="checkAddMenu"
		@keyup="handleKeyDown"
		@wheel="handleWheelZoom"
		@mousemove.self="handleMouseMove"
		:class="{ 'is-razoring': isRazoring }"
		:style="{
			fontSize: `${zoomScale}px`,
			backgroundSize: `${zoomScale * backgroundScale}px ${zoomScale * backgroundScale}px`,
			backgroundPosition: `${panX}px ${panY}px`,
		}"
	>
		<!-- this container will host all the moveable elements, it will move with the pan -->
		<div
			class="pan-container"
			:style="{
				transform: `translate(${panX}px, ${panY}px)`,
			}"
		>
			<!-- spawn all wires here -->
			<WireRenderer :graph="graph" />

			<!--
				Loop through all the nodes and render them.

				NOTE on the inline `font-size` binding:
				The entire library uses an em-based sizing scheme — every padding,
				border-radius, button width, icon size, etc. is declared in `em`,
				with a tiny anchor font-size at the top so 1em ≈ 1px. The anchor
				is `${zoomScale}px` so zooming the canvas naturally rescales every
				em value at once.

				The anchor used to live on `.editor-container` only and rely on
				inheritance to propagate down through `.pan-container` → Node → all
				the way into deeply-nested input widgets. That long cascade is
				fragile in consumer apps — any global CSS rule (especially anything
				with `!important`) along the chain can reset font-size and the
				whole em system drifts. Symptom: tiny ◀ ▶ buttons inside number
				inputs render huge enough to cover the entire input row.

				Anchoring the font-size directly on each `.node-instance` makes the
				cascade one-deep from here to every em-based descendant, so consumer
				CSS can't defeat it without explicitly targeting our scoped class.
			-->
			<Node
				v-for="(node, index) in graph.nodes.value"
				class="node-instance"
				:style="{ fontSize: `${zoomScale}px` }"
				:key="node.id"
				:data-node-id="node.id"
				:graph="graph"
				:node="node"
			/>

			<!-- box to show rectangle when box selecting -->
			<SelectBox
				v-if="graph.selMgr.isBoxSelecting.value"
				:selMgr="graph.selMgr"
			/>

		</div>

		<!-- razor line: lives in editor-container space (not pan-container) so coords are simple screen px -->
		<svg v-if="isRazoring" class="razor-svg" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible;">
			<defs>
				<filter id="razor-drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
					<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="rgba(255,180,60,0.9)"/>
				</filter>
			</defs>
			<!-- soft glow halo -->
			<line
				:x1="razorStartPx.x" :y1="razorStartPx.y"
				:x2="razorEndPx.x"   :y2="razorEndPx.y"
				class="razor-glow"
			/>
			<!-- sharp blade line -->
			<line
				:x1="razorStartPx.x" :y1="razorStartPx.y"
				:x2="razorEndPx.x"   :y2="razorEndPx.y"
				class="razor-blade"
			/>
		</svg>

		<!-- add menu button if enabled -->
		<AddButton
			v-if="showAddButton"
			class="add-menu-button"
			@showAddMenu="handleAddMenuButton"
		/>

	</div>

</template>
<script setup>

// vue
import { ref, onMounted, provide, inject, reactive } from 'vue';

// utils
import { useAddMenu } from '@/composables/useAddMenu';
import { nodeClassRegistry } from '@/classes/Nodes/index.js';

// module-level clipboard shared across all NodeGraphRenderer instances (cross-graph paste support)
let _clipboard = null;

// components
import Node from '@Components/Node.vue';
import WireRenderer from '@Components/WireRenderer.vue';
import SelectBox from './SelectBox.vue';
import AddButton from './TypeWidgets/AddButton.vue';

// props
const props = defineProps({

	// reference to the NWEditor instance
	editor: {
		type: Object,
		required: true,
	},

	// reference to an NWGraph object to render / interact with, etc.
	graph: {
		type: Object,
		required: true,
	},

	// allow the background to have some auto-scale applied by component
	backgroundScale: {
		type: Number,
		default: 20
	},

	// show add menu
	showAddButton: {
		type: Boolean,
		default: false
	},
});

const {
	menuIsOpen
} = useAddMenu();


// events
const emits = defineEmits(['showAddMenu']);

// get our re-usable drag helper
const dh = inject('dh');

// pan & zoom
const panX = ref(0);
const panY = ref(0);
const zoomScale = ref(1);

// we'll save the last mouse move even for keyboard shortcuts, etc
let lastMouseEvent = null;

// razor-cut state — positions are in screen px relative to the editor-container
const isRazoring  = ref(false);
const razorStartPx = reactive({ x: 0, y: 0 });
const razorEndPx   = reactive({ x: 0, y: 0 });

// we'll keep a global map of socket positions
const socketPositions = reactive(new Map());
provide('socketPositions', socketPositions);

// ref to our container	
const containerEl = ref(null);

// pack up & provide these refs
const viewport = {
	panX,
	panY,
	zoomScale,
	el: null,
};
provide('viewport', viewport);

onMounted(()=>{

	// assign the el ref now that we're mounted
	viewport.el = containerEl.value;
});

// true if the user right-moused-wn and moved the mouse
const didPan = ref(false);
const MAX_ZOOM = 5.0;
const MIN_ZOOM = 0.1;


/**
 * Handles zooming in and out of the editor container
 * 
 * @param {WheelEvent} e - the wheel event
 */
 function handleWheelZoom(e) {
	
	e.preventDefault();

	if (e.shiftKey)
		return;

	const delta = e.deltaY < 0 ? 1 : -1;
	const oldZoom = zoomScale.value;
	const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom + delta * 0.1));

	// No change? Skip
	if (newZoom === oldZoom)
		return;

	// Get bounding box of container
	const container = e.currentTarget.getBoundingClientRect();

	// Mouse position relative to the container
	const mouseX = e.clientX - container.left;
	const mouseY = e.clientY - container.top;

	// Compute position within the zoomed/panned content (in virtual space)
	const offsetX = (mouseX - panX.value) / oldZoom;
	const offsetY = (mouseY - panY.value) / oldZoom;

	// Update zoom scale
	zoomScale.value = newZoom;

	// Adjust pan so the content under the cursor stays in place
	panX.value = mouseX - offsetX * newZoom;
	panY.value = mouseY - offsetY * newZoom;
}


/**
 * Alt + LMB anywhere on the container (or its children) → razor-cut drag.
 * This fires on all mousedowns (no .self), so it works even when clicking over nodes.
 *
 * @param {MouseEvent} e - the mouse event
 */
function maybeStartRazor(e) {
	if (e.button === 0 && e.altKey) {
		startRazorDrag(e);
	}
}


/**
 * If it's left click, we start a box-drag operation to select nodes
 * If it's right click, we start a pan operation
 * (Alt + LMB is handled separately by maybeStartRazor above)
 *
 * @param {MouseEvent} e - the mouse event
 */
function startDragOperation(e){

	// Alt+LMB is handled by maybeStartRazor — skip here
	if (e.altKey) return;

	// if left-click && shift is not pressed, de-select everything first
	if (e.button===0 &&  !e.shiftKey) {
		props.graph.selMgr.selectNone();
	}

	// left click = box select
	if (e.button === 0) {
		startSelectDrag(e);
	}
	// right click = pan
	else if (e.button === 2) {
		startPanDrag(e);
	}
}


/**
 * Starts a box-drag selection operation
 * 
 * @param {MouseEvent} e - the mouse event
 */
function startSelectDrag(e){

	// tell our selection manager to start a drag-select operation
	props.graph.selMgr.startDragSelect(e, viewport, dh);
}


/**
 * Handles dragging the pan container around
 * 
 * @param {MouseEvent} e - the mouse event
 */
function startPanDrag(e){
	
	// prevent default behaviors
	e.cancelBubble = true;
	e.preventDefault();

	// gtfo if not right-click
	if (e.button !== 2)
		return;
	
	// save our initial x/y
	const startX = panX.value;
	const startY = panY.value;

	// clear until we moved a bit
	didPan.value = false;

	dh.dragStart(
		(dx, dy)=>{

			// update our pan x/y values
			panX.value = startX - dx;
			panY.value = startY - dy;

			// use pythagorean theorem to see if we moved enough to consider it a pan
			const panThreshold = 5;
			if (!didPan.value && (dx * dx + dy * dy) > panThreshold * panThreshold) {
				didPan.value = true;
			}
		},
		(dx, dy) => {

		},

	)
}


/**
 * If the user right-clicked, we want to show the add node menu
 * 
 * @param {MouseEvent} event - the mouse event
 */
 function checkAddMenu(event) {

	// if its not right click, gtfo
	if (event.button !== 2)
		return;

	// this function is bound to @mouseup, but there's a chance the user was right-click panning
	// so if we see a pan happened, gtfo
	if (didPan.value) {
		didPan.value = false;
		return;
	}

	// clear it either way
	didPan.value = false;

	// prevent default context menu
	event.preventDefault();

	emits('showAddMenu', {
		event, 
		graph: props.graph,
		viewport
	});	
}


/**
 * Handle click on the add menu button, emit event to show add menu
 * 
 * @param event - the mouse event
 */
function handleAddMenuButton(event){

	// prevent default context menu
	emits('showAddMenu', {
		event, 
		graph: props.graph,
		viewport
	});	
}


/**
 * Returns true if a text-entry element currently has focus,
 * meaning we should NOT consume keyboard shortcuts that produce characters.
 */
function isEditingText() {
	const el = document.activeElement;
	return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}


/**
 * Handle key down events for shortcuts, etc
 *
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyDown(event) {

	// reset zoom and pan on "home" key
	if(event.key === 'Home') {
		zoomScale.value = 1;
		panX.value = 0;
		panY.value = 0;
	}

	// shift + A = show add node menu
	if(event.key.toLowerCase() === 'a' && event.shiftKey && !isEditingText()) {
		emits('showAddMenu', {
			event: lastMouseEvent,
			graph: props.graph,
			viewport
		});
	}

	// Delete / Backspace / x = delete selected nodes (only when graph container has focus)
	const isDeleteKey = event.key === 'Delete' || event.key === 'Backspace' || event.key === 'x';
	if(isDeleteKey && !isEditingText()) {
		const selected = [...props.graph.selMgr.selectedNodes.value];
		if(selected.length > 0) {
			props.graph.selMgr.selectNone();
			selected.forEach(node => props.graph.removeNode(node));
			event.preventDefault();
		}
	}

	// Ctrl/Cmd + C = copy selected nodes (skip when a text input has focus)
	if(event.key === 'c' && (event.ctrlKey || event.metaKey) && !isEditingText()) {
		copySelectedNodes();
		event.preventDefault();
	}

	// Ctrl/Cmd + V = paste clipboard at cursor (skip when a text input has focus)
	if(event.key === 'v' && (event.ctrlKey || event.metaKey) && !isEditingText()) {
		if(_clipboard) {
			const cursorPos = dh.getCursorPos(); // window page coords
			const rect = containerEl.value.getBoundingClientRect();
			const pasteX = (cursorPos.x - rect.left - panX.value) / zoomScale.value;
			const pasteY = (cursorPos.y - rect.top - panY.value) / zoomScale.value;
			pasteFromClipboard(_clipboard, pasteX, pasteY);
		}
		event.preventDefault();
	}
}


/**
 * Copies the currently selected nodes (and the wires between them) to the clipboard.
 */
function copySelectedNodes() {

	const graph = props.graph;
	const selected = graph.selMgr.selectedNodes.value;
	if(selected.length === 0) return;

	const selectedIds = new Set(selected.map(n => n.id));

	// serialize selected nodes
	const nodes = selected.map(n => n.serialize());

	// only include wires where BOTH endpoints are within the selection
	const wires = graph.connMgr.wires.value
		.filter(w =>
			w.inputNode && w.outputNode &&
			selectedIds.has(w.inputNode.id) &&
			selectedIds.has(w.outputNode.id)
		)
		.map(w => w.serialize());

	_clipboard = { nodes, wires };
}


/**
 * Pastes nodes from clipboard into the current graph, centered on the given graph-space point.
 * New node IDs are generated so pasted nodes are independent of the originals.
 *
 * @param {Object} clipboardData - { nodes: [...], wires: [...] } snapshot from copySelectedNodes
 * @param {Number} centerX - target X position in graph space (center of the pasted group)
 * @param {Number} centerY - target Y position in graph space (center of the pasted group)
 */
function pasteFromClipboard(clipboardData, centerX, centerY) {

	const graph = props.graph;
	const { nodes: nodeDataList, wires: wireDataList } = clipboardData;
	if(!nodeDataList?.length) return;

	// 1. Compute centroid of the original positions
	let sumX = 0, sumY = 0;
	nodeDataList.forEach(nd => { sumX += nd.x; sumY += nd.y; });
	const origCenterX = sumX / nodeDataList.length;
	const origCenterY = sumY / nodeDataList.length;
	const offsetX = centerX - origCenterX;
	const offsetY = centerY - origCenterY;

	// 2. Create new node instances, build old-ID → new-ID map
	const idMap = new Map();
	const newNodes = [];

	nodeDataList.forEach(nd => {
		const lookupKey = nd.serializeKey || nd.class;
		const nodeDetails = nodeClassRegistry.get(lookupKey);
		if(!nodeDetails) return;

		// Construct fresh node (gets a brand-new ID via the constructor)
		const newNode = new nodeDetails.class(graph);
		if(nodeDetails.key) newNode._serializeKey = nodeDetails.key;

		// Record old→new ID mapping before deserialize overwrites the ID
		const newId = newNode.id;
		idMap.set(nd.id, newId);

		// Deserialize field values and position, but inject the new ID so the old one isn't restored
		newNode.deserialize({
			...nd,
			id: newId,
			x: nd.x + offsetX,
			y: nd.y + offsetY,
		});

		graph.nodes.value = [...graph.nodes.value, newNode];
		newNodes.push(newNode);
	});

	// 3. Re-create wires using the new IDs
	wireDataList.forEach(wd => {
		const newInputId  = idMap.get(wd.inputNodeId);
		const newOutputId = idMap.get(wd.outputNodeId);
		if(!newInputId || !newOutputId) return;

		const inputNode  = graph.nodes.value.find(n => n.id === newInputId);
		const outputNode = graph.nodes.value.find(n => n.id === newOutputId);
		if(!inputNode || !outputNode) return;

		const inputField  = inputNode.fieldsList.value.find(f =>
			(wd.inputFieldName  && f.name === wd.inputFieldName)  || f.id === wd.inputFieldId
		);
		const outputField = outputNode.fieldsList.value.find(f =>
			(wd.outputFieldName && f.name === wd.outputFieldName) || f.id === wd.outputFieldId
		);
		if(!inputField || !outputField) return;

		const conn = graph.connMgr.addConnectionBasic();
		conn.setInput(inputNode, inputField);
		conn.setOutput(outputNode, outputField);
	});

	graph.updateIO();

	// 4. Select the newly pasted nodes — route through the SelMgr's helper
	// so EditorState's last-touched-wins promotion fires on the paste action.
	graph.selMgr.setSelected(newNodes);
}


// ─── Razor-cut ────────────────────────────────────────────────────────────────

/**
 * Begins a razor-cut drag operation (Alt + LMB).
 * Draws a line overlay in screen space; on release severs any wires the line crosses.
 *
 * @param {MouseEvent} e - the initiating mousedown event
 */
function startRazorDrag(e) {

	e.preventDefault();
	e.stopPropagation();

	// Capture rect once — used to convert screen→graph for wire cutting
	const rect = containerEl.value.getBoundingClientRect();

	// Helper: screen px (container-relative) → graph space (em units)
	const screenToGraph = (sx, sy) => ({
		x: (sx - panX.value) / zoomScale.value,
		y: (sy - panY.value) / zoomScale.value,
	});

	// Initial position in container-relative screen pixels
	const startSx = e.clientX - rect.left;
	const startSy = e.clientY - rect.top;

	razorStartPx.x = startSx;
	razorStartPx.y = startSy;
	razorEndPx.x   = startSx;
	razorEndPx.y   = startSy;
	isRazoring.value = true;

	dh.dragStart(
		() => {
			// getCursorPos() returns pageX/pageY; subtract page offset of the container
			const cur = dh.getCursorPos();
			razorEndPx.x = cur.x - (rect.left + window.scrollX);
			razorEndPx.y = cur.y - (rect.top  + window.scrollY);
		},
		() => {
			isRazoring.value = false;
			cutWiresWithRazor(
				screenToGraph(razorStartPx.x, razorStartPx.y),
				screenToGraph(razorEndPx.x,   razorEndPx.y)
			);
		}
	);
}


/**
 * Severs all wires whose bezier curve is crossed by the given line segment.
 * Uses the same bezier control-point formula as Wire.vue.
 *
 * @param {{ x: number, y: number }} a - razor line start (graph space)
 * @param {{ x: number, y: number }} b - razor line end   (graph space)
 */
function cutWiresWithRazor(a, b) {

	// guard: only act on actual drags, not accidental clicks
	const dx = b.x - a.x, dy = b.y - a.y;
	if(dx * dx + dy * dy < 4) return;

	const wiresToCut = [];

	for(const wire of props.graph.connMgr.wires.value) {

		// get the four bezier control points in graph space
		const bez = getWireBezierGraphSpace(wire);
		if(!bez) continue;

		// sample the bezier at sufficient density and test each chord against the razor
		const pts = sampleCubicBezier(bez, 32);
		for(let i = 0; i < pts.length - 1; i++) {
			if(segmentsIntersect(a, b, pts[i], pts[i + 1])) {
				wiresToCut.push(wire);
				break;
			}
		}
	}

	wiresToCut.forEach(w => w.destroy());
}


/**
 * Returns the four cubic-bezier control points for a wire in graph space,
 * using the same formula as Wire.vue's SVGDetails computed property.
 *
 * @param {Connection} wire
 * @returns {{ p0, p1, p2, p3 } | null}
 */
function getWireBezierGraphSpace(wire) {

	// Wire.vue populates lastPositions (in graph space) whenever it renders
	const lp = wire.lastPositions;
	const startX = lp?.startX ?? wire.positions?.startX ?? null;
	const startY = lp?.startY ?? wire.positions?.startY ?? null;
	const endX   = lp?.endX   ?? wire.positions?.endX   ?? null;
	const endY   = lp?.endY   ?? wire.positions?.endY   ?? null;

	if(startX === null || endX === null) return null;

	const w = Math.abs(endX - startX);
	const cpw = (w / 3) * 1.5;

	return {
		p0: { x: startX,       y: startY },
		p1: { x: startX + cpw, y: startY },
		p2: { x: endX   - cpw, y: endY   },
		p3: { x: endX,         y: endY   },
	};
}


/**
 * Samples N+1 evenly-spaced points along a cubic bezier.
 *
 * @param {{ p0, p1, p2, p3 }} bez
 * @param {number} n - number of segments (n+1 points returned)
 * @returns {{ x: number, y: number }[]}
 */
function sampleCubicBezier({ p0, p1, p2, p3 }, n = 32) {

	const pts = [];
	for(let i = 0; i <= n; i++) {
		const t  = i / n;
		const mt = 1 - t;
		pts.push({
			x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
			y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
		});
	}
	return pts;
}


/**
 * Returns the signed 2-D cross product of vectors (B-A) × (P-A).
 */
function cross2d(ax, ay, bx, by, px, py) {
	return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}


/**
 * Returns true if line-segment AB properly intersects line-segment CD.
 * Uses the standard cross-product straddle test.
 */
function segmentsIntersect(a, b, c, d) {

	const d1 = cross2d(c.x, c.y, d.x, d.y, a.x, a.y);
	const d2 = cross2d(c.x, c.y, d.x, d.y, b.x, b.y);
	const d3 = cross2d(a.x, a.y, b.x, b.y, c.x, c.y);
	const d4 = cross2d(a.x, a.y, b.x, b.y, d.x, d.y);

	return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
	       ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

// ──────────────────────────────────────────────────────────────────────────────


/**
 * Focus self on mouse move
 * 
 * @param event - the mouse event
 */
function handleMouseMove(event) {
	lastMouseEvent = event;

	if(menuIsOpen.value==false)
		containerEl.value.focus();
}

</script>
<style lang="scss" scoped>

	// the editor container where we spawn nodes, allow editing etc
	.editor-container {

		// this will allow the editor container to scroll if it's contents overflow
		overflow: hidden;

		// default styles
		background: var(--nw-graph-b-g-color);
		background-image: var(--nw-graph-b-g-image);
		background-repeat: repeat;

		// this is the box that actually translates it's x/y to pan stuff
		.pan-container {
			position: absolute;
		}// .pan-container

		// razor line SVG: covers the full editor-container in screen space
		.razor-svg {

			.razor-glow {
				stroke: rgba(255, 140, 40, 0.45);
				stroke-width: 8;
				stroke-linecap: round;
				fill: none;
			}

			.razor-blade {
				stroke: rgba(255, 220, 80, 1);
				stroke-width: 2;
				stroke-linecap: round;
				stroke-dasharray: 8 4;
				fill: none;
				filter: url(#razor-drop-shadow);
			}
		}// .razor-svg

		// crosshair cursor during razor draw
		&.is-razoring {
			cursor: crosshair !important;
		}

	}// .editor-container

</style>
