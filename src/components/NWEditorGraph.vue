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
		<div 
			v-if="ctxRef != null"
			class="positioning-reset"			
		>
			asd
		</div>

		<!-- this wrapper does not scroll, and allows for overflow. Misc UI, such as errors, toasts, menus, etc should mount here -->
		<div class="ui-container fill-parent">

			<!-- if the user wants to see dev errors, they can enable this component -->
			<DevErrors 
				v-if="ctxRef != null && showDevErrors" 
				:nwSystem="ctxRef"
			/>

			<!-- this is both a menu that pops up, but also and entire layer
				that overlaps everything. Mostly invisible. -->
			<AddNodeMenu
				v-if="ctxRef != null"
				:nwSystem="ctxRef"
			/>

		</div>

		<!-- tool tip for errors when wiring up sockets -->
		<CursorPopup 
			ref="cursorPopupEl"
		/>
	</div>
</template>
<script setup>

// vue
import { ref, shallowRef, onMounted, provide, watch } from 'vue';

// components
import DevErrors from '@Components/DevErrors.vue';
import AddNodeMenu from '@Components/AddNodeMenu.vue';
import Node from '@Components/Node.vue';
import WireRenderer from '@Components/WireRenderer.vue';
import CursorPopup from './CursorPopup.vue';

// our app
import NWEditor from '../classes/NWEditor.js';

// lib/misc
import DragHelper from 'gdraghelper';

// define some props
const props = defineProps({

	// the initial base graph can be set/changed via this prop
	graph: {
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
		default: 20
	},

});


// els
const cursorPopupEl = ref(null);
provide('cursorPopupEl', cursorPopupEl);

// our context will either be passed in via the props, or one we made locally
let ctx = null;
const ctxRef = shallowRef(null);
provide('ctx', ctxRef);

// make a new DragHelper instance
const dh = new DragHelper();
provide('dh', dh);

// on mounted, initialize the component and optionally, state
onMounted(() => {

	// make new context if one wasn't provided
	ctx = new NWEditor();
	ctxRef.value = ctx;
});

// update root graph if the prop changes
watch(() => props.graph, (newVal) => {
	if (newVal)
		ctx.setRootGraph(newVal);
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



function showAddMenu(){

	// show the add node menu
	ctx.showAddNodeMenu(e.clientX, e.clientY);
}


</script>

<style lang="scss" scoped>

	// main outer wrapper for the entire node-graph system
	.NWEditorGraph {

		// some default styles
		/* border: 2px solid red; */
		// border-radius: 4px;

		font-family: sans-serif;
		
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

			// ui container doesn't respond to zooming, so this will have a normal font size
			font-size: 20px;

			pointer-events: none;

			&>* {
				pointer-events: initial;
			}
			
		}// .ui-container

		* {
			box-sizing: border-box;
			user-select: none;

			// for debug
			// text-decoration: underline !important;
		}

	}// .NWEditorGraph

</style>
