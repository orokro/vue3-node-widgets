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
			:showDevErrors="true" 
		/>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted } from 'vue';

// our app
import NWEditorGraph from '@Components/NWEditorGraph.vue';

// ref to our graph, so we can expose to window for debugging
const myGraph = ref(null);

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
