<!--
	GraphWindow.vue
	---------------

	For our vue-win-mgr system, this will be the window that loads the NWEditorGraph.vue component.
-->
<template>

	<div class="graph-window">

		<NWEditorGraph 
			ref="myGraph" 
			class="my-graph" 
			:graph="app.currentGraph.value"
			:showDevErrors="true" 
		/>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, inject } from 'vue';

// our app
import NWEditorGraph from '@Components/NWEditorGraph.vue';

// ref to our graph, so we can expose to window for debugging
const myGraph = ref(null);

// get our app data
const app = inject('app');

// get context of the editor graph
let ctx = null;
const ctxRef = ref(null);

onMounted(() => {

	// get the context of our node graph
	ctx = myGraph.value.getContext();
	ctxRef.value = ctx;
});

</script>
<style lang="scss" scoped>

	// container for the entire graph window
	.graph-window {

		// for debug
		/* border: 2px solid red; */

		// fill container
		width: 100%;
		height: 100%;
		overflow: clip;
		position: relative;

	}// .graph-window

</style>
