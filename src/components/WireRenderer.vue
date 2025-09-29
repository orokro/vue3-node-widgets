<!--
	WireRenderer.vue
	----------------

	Renders all the wires currently in the graph.
-->
<template>

	<div class="wire-renderer-container">

		<Wire
			v-for="(wire, index) in graph.wires.value" 
			:key="wire.id" 
			:graph="graph"
			:wire="wire"
		/>

	</div>

</template>
<script setup>

// vue
import { ref, onMounted } from 'vue';

// components
import Wire from './Wire.vue';

// define some props
const props = defineProps({
	
	// the graph we're in
	graph: {
		type: Object,
		required: true,
	},

});

onMounted(()=>{
	
});


</script>
<style lang="scss" scoped>

	// main container for spawning wires
	.wire-renderer-container {

		// so we can position children absolutely
		position: relative;

		// for debugging purposes, we can see the container
		/* border: 1px solid red; */

	}// .wire-renderer-container

</style>
