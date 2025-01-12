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
			<div class="editor-container fill-parent">

			</div>

			<!-- this wrapper does not scroll, and allows for overflow. Misc UI, such as errors, toasts, menus, etc should mount here -->
			<div class="ui-container fill-parent">

			</div>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted } from 'vue';

// our app
import NWEditor from '../classes/NWEditor.js';

// define some props
const props = defineProps({

	// optional reference to an existing NWSystem instance
	stateCtx: {
		type: Object,
		default: null
	},

});

// our context will either be passed in via the props, or one we made locally
let ctx = null;

// on mounted, initialize the component and optionally, state
onMounted(()=>{

	// if a context for our state was passed in, save it's reference, otherwise,
	// we need to create our own state context
	if(props.stateCtx){
		ctx = props.stateCtx;
	}else{
		ctx = new NWEditor();
	}

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
function getContext(){
	return ctx;
}


// define our public API
defineExpose({
	getContext
});

</script>
<style lang="scss" scoped>

	// main outer wrapper for the entire node-graph system
	.NWEditorGraph {

		// some default styles
		border: 2px solid black;
		border-radius: 4px;

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
		}// .ui-container

		// the editor container where we spawn nodes, allow editing etc
		.editor-container {

			// this will allow the editor container to scroll if it's contents overflow
			overflow: hidden;

			// default styles
			background: rgba(0,0,0,0.1);

		}// .editor-container

	}// .NWEditorGraph

</style>
