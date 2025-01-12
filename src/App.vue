<!--
	App.vue
	-------

	Main entry point to the application
-->
<template>
	<main>
		<div class="positioning-box">

			<!-- our main node-editor system -->
			<NWEditorGraph
				ref="myGraph"
				class="my-graph"
			/>
		</div>

		<!-- test junk -->
		<div v-if="false" class="testJunk">
			<h1>{{ myValueA }}</h1>
			<button @click="myValueA=5">Set A 5</button>
			<button @click="myValueB=10">Set B 10</button>
		</div>

	</main>
</template>
<script setup>

// vue
import { ref, onMounted } from 'vue';

// components
import NWEditorGraph from './components/NWEditorGraph.vue';

// ref to our graph, so we can expose to window for debugging
const myGraph = ref(null);

// for vue testing
const myValueA = ref(0);
const myValueB = myValueA;

onMounted(()=>{
	// expose our graph to the window for debugging
	window.mg = myGraph.value;
});

</script>
<style lang="scss" scoped>

	// box to test positioning / layout of our component
	.positioning-box {

		// fill the parent container
		position: absolute;
		top: 30px;
		left: 60px;
		width: 1000px;
		height: 800px;

	}// .positioning-box

	.testJunk {

		border: 2px solid black;

		// fill the parent container
		position: absolute;
		top: 30px;
		left: 1160px;
		width: 400px;
		height: 800px;
	}

</style>
