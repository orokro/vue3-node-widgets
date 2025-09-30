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
			<!-- always show our contexts root graph -->
			<NodeGraphRenderer
				:editor="ctxRef"
				:graph="ctxRef.rootGraphRef.value"
				:backgroundScale="backgroundScale"
				@showAddMenu="showAddMenu"
			/>
		</div>

		<!-- this wrapper does not scroll, and allows for overflow. Misc UI, such as errors, toasts, menus, etc should mount here -->
		<div class="ui-container fill-parent">

			<!-- The breadcrumb list, only shown if we're in a sub-graph -->
			<BreadcrumbList 
				v-if="ctxRef != null"
				:editor="ctxRef"
			/>

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
				:graphCtx="menuGraphCtx"
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
import NodeGraphRenderer from '@Components/NodeGraphRenderer.vue';
import DevErrors from '@Components/DevErrors.vue';
import AddNodeMenu from '@Components/AddNodeMenu.vue';
import CursorPopup from '@Components/CursorPopup.vue';
import BreadcrumbList from './BreadcrumbList.vue';

// our app
import NWEditor from '@src/classes/NWEditor.js';

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

// when we show a menu, we'll save the contextual graph for which to add nodes
const menuGraphCtx = shallowRef({
	graph: props.graph
});

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

	// if we have a graph prop, set it as the root graph
	if (props.graph)
		ctxRef.value.setRootGraph(props.graph);
});

// update root graph if the prop changes
watch(() => props.graph, (newVal) => {
	if (newVal)
		ctxRef.value.setRootGraph(newVal);
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
 * Shows the add node menu at the mouse position
 * 
 * @param context - the context of the event, including event, graph, viewport, etc
 */
function showAddMenu(context){

	// destructure the context
	const { event, graph, viewport } = context;

	// get client x/y
	const x = event.clientX;
	const y = event.clientY;

	// get viewport bounding box
	const rect = viewport.el.getBoundingClientRect();

	// compute the mouse position in graph space
	const menuX = x - rect.left;
	const menuY = y - rect.top;

	// save graph for the menu to add nodes to
	menuGraphCtx.value = {
		...context,
		ctx,
		pos: {
			x: menuX,
			y: menuY
		}
	};

	// show the add node menu
	ctx.showAddNodeMenu(menuX, menuY);
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
