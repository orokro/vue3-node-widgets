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
		class="editor-container fill-parent" 
		tabindex="0"
		@mousedown="startPanDrag"		
		@mouseup="checkAddMenu"		
		@keydown="handleKeyDown"
		@wheel="handleWheelZoom"		
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
			
			<!-- loop through all the nodes and render them -->
			<Node 
				v-for="(node, index) in graph.nodes.value" 
				:key="index" 
				:graph="graph"
				:node="node"
			/>
		</div>

	</div>

</template>
<script setup>

// vue
import { ref, onMounted, provide, inject, computed } from 'vue';

// components
import DevErrors from '@Components/DevErrors.vue';
import AddNodeMenu from '@Components/AddNodeMenu.vue';
import Node from '@Components/Node.vue';
import WireRenderer from '@Components/WireRenderer.vue';
import CursorPopup from './CursorPopup.vue';

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

});

// events
const emits = defineEmits(['showAddMenu']);

// get our re-usable drag helper
const dh = inject('dh');

// pan & zoom
const panX = ref(0);
const panY = ref(0);
const zoomScale = ref(1);

// pack up & provide these refs
const viewport = {
	panX,
	panY,
	zoomScale,
};
provide('viewport', viewport);

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

	if (e.shiftKey) return;

	const delta = e.deltaY < 0 ? 1 : -1;
	const oldZoom = zoomScale.value;
	const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom + delta * 0.1));

	// No change? Skip
	if (newZoom === oldZoom) return;

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
 * Handles dragging the pan container around
 * 
 * @param {MouseEvent} e - the mouse event
 */
function startPanDrag(e){
	
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
 * @param {MouseEvent} e - the mouse event
 */
 function checkAddMenu(e) {

	// if its not right click, gtfo
	if (e.button !== 2)
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
	e.preventDefault();

	emits('showAddMenu');	
}


/**
 * Handle key down events for shortcuts, etc
 * 
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyDown(event) {

	if(event.key === 'Home') {
		zoomScale.value = 1;
		panX.value = 0;
		panY.value = 0;
	}
}


</script>
<style lang="scss" scoped>

	// the editor container where we spawn nodes, allow editing etc
	.editor-container {

		// this will allow the editor container to scroll if it's contents overflow
		overflow: hidden;

		// default styles
		background: rgb(133, 126, 151);
		background: rgb(60, 60, 60);
		background-image: url(/img/grid_bg.png);
		background-repeat: repeat;

		// this is the box that actually translates it's x/y to pan stuff
		.pan-container {	

			position: absolute;

			// for debug
			/* min-width: 640em;
			min-height: 480em;
			border: 1px solid red; */

			// test boxes
			.a-test-box {
				width: 100em;
				height: 100em;
				background: lightblue;

				&.b {
					position: relative;

					left: 500em;
				}

				span {
					font-size: 20em;;
				}
			}//.a-test-box

		}// .pan-container

	}// .editor-container

</style>
