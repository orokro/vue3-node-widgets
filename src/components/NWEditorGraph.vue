<!--
	NWEditorGraph.vue
	-----------------

	This is the main component for mounting user-editable node widget graphs.

	This rectangular space will be draggable, zoomable, and will contain a grid of nodes and wires connecting them.

	This component will provide it's own state (NWSystem) class if none is provided.
-->
<template>

	<!-- main outermost wrapper for the entire node-graph system -->
	<div class="NWEditorGraph">

		<!-- wrapper used to reset the relative/absolute positioning for the component
		  (the user might style our outer .NWEditorGraph element via style attrs/props and/or css, etc )-->
		<div class="positioning-reset">

			<!-- this is the actual scrollable area where nodes, wires, etc appear and are editable. This clips/clamps overflow -->
			<div 
				class="editor-container fill-parent" 
				@mousedown="startPanDrag"
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
						left: `${panX}px`,
						top: `${panY}px`,
					}"
				>

					<div class="a-test-box"><span>foo</span></div>
					<div class="a-test-box b"><span>bar</span></div>
				</div>

				<!-- this wrapper does not scroll, and allows for overflow. Misc UI, such as errors, toasts, menus, etc should mount here -->
				<div class="ui-container fill-parent">

					<!-- if the user wants to see dev errors, they can enable this component -->
					<DevErrors 
						v-if="ctxRef != null && showDevErrors" 
						:nwSystem="ctx"
					/>

					<!-- this is both a menu that pops up, but also and entire layer
					 that overlaps everything. Mostly invisible. -->
					<AddNodeMenu
						v-if="ctxRef != null"
						:nwSystem="ctx"
					/>

				</div>

			</div>
		</div>

	</div>
</template>
<script setup>

// vue
import { ref, onMounted } from 'vue';

// components
import DevErrors from '@Components/DevErrors.vue';
import AddNodeMenu from '@Components/AddNodeMenu.vue';

// our app
import NWEditor from '../classes/NWEditor.js';

// lib/misc
import DragHelper from 'gdraghelper';

// define some props
const props = defineProps({

	// optional reference to an existing NWSystem instance
	stateCtx: {
		type: Object,
		default: null
	},

	// show the dev errors component
	showDevErrors: {
		type: Boolean,
		default: false
	},

	// allow the background to have some auto-scale applied by component
	backgroundScale: {
		type: Number,
		default: 25
	},

});

// our context will either be passed in via the props, or one we made locally
let ctx = null;
const ctxRef = ref(null);

// our pan & zoom variables
const panX = ref(0);
const panY = ref(0);
const zoomScale = ref(1.0);
const MAX_ZOOM = 5.0;
const MIN_ZOOM = 0.1;

// make a new DragHelper instance
const dh = new DragHelper();

// on mounted, initialize the component and optionally, state
onMounted(() => {

	// if a context for our state was passed in, save it's reference, otherwise,
	// we need to create our own state context
	if (props.stateCtx) {
		ctx = props.stateCtx;
	} else {
		ctx = new NWEditor();
	}
	ctxRef.value = ctx;

});


/**
 * Public exposed method to get the current state context
 *
 * NOTE: this will be like on a <canvas> element
 * Instead of myCanvasEl.getContext('2d'),
 * If the user has reference to our NWEditorGraph component,
 * they can call getContext() to get the current state context.
 *
 * With just the context, they can manipulate / evaluate the graph as necessary.
 */
function getContext() {
	return ctx;
}


// define our public API
defineExpose({
	getContext
});



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

	dh.dragStart(
		(dx, dy)=>{

			// update our pan x/y values
			panX.value = startX - dx;
			panY.value = startY - dy;

		},
		(dx, dy) => {

		},

	)
}

</script>
<style lang="scss" scoped>

	// main outer wrapper for the entire node-graph system
	.NWEditorGraph {

		// some default styles
		// border: 2px solid black;
		// border-radius: 4px;

		// this will fill our parent container 100% width and height, with relative positioning
		// this way, the main root element, NWEditorGraph, can be styled by the user and flow in their layout however they see fit
		position: relative;
		width: 100%;
		height: 100%;

		// both the ui container and the editor container will fill the parent container, on top of each other
		.fill-parent {

			// fill the parent container, with no flow
			position: absolute;
			inset: 0px 0px 0px 0px;

		}// .fill-parent
		

		// the UI layer itself shouldn't have any pointer interactions, though it's children may.
		.ui-container {

			pointer-events: none;

			&>* {
				pointer-events: initial;
			}
			
		}// .ui-container

		// the editor container where we spawn nodes, allow editing etc
		.editor-container {

			// this will allow the editor container to scroll if it's contents overflow
			overflow: hidden;

			// default styles
			background: rgb(133, 126, 151);
			background-image: url(/img/grid_bg.png);
			background-repeat: repeat;
			
			// this is the box that actually translates it's x/y to pan stuff
			.pan-container {	

				position: absolute;

				// for debug
				min-width: 640em;
				min-height: 480em;
				border: 1px solid red;

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

	}// .NWEditorGraph

</style>
