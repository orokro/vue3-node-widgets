<!--
	App.vue
	-------

	Main entry point to the application
-->
<template>
	<main @contextmenu="disableContextMenu">
		<div class="positioning-box">

			<!-- our main node-editor system -->
			<NWEditorGraph ref="myGraph" class="my-graph" :showDevErrors="true" />
		</div>

		<!-- test junk -->
		<div v-if="false" class="testJunk">
			<h1>{{ myValueA }}</h1>
			<button @click="myValueA = 5">Set A 5</button>
			<button @click="myValueB = 10">Set B 10</button>
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

// import all our nodes
import { 
	ABMathNode,
	ABCompareNode,
	ClampValueNode,
	LerpValueNode,
	ColorMixNode,
	ColorPickerNode,
	MapRangeNode,
	RandomColorNode,
	RandomNumberNode,
	RoundNode,
	TrigNode,
	AllTypesNode,
	AllTypesOutNode,
} from '@Nodes/index.js';

// for vue testing
const myValueA = ref(0);
const myValueB = myValueA;

let ctx = null;

onMounted(() => {
	
	// expose our graph to the window for debugging
	window.mg = myGraph.value;

	ctx = mg.getContext();

	// add some debug nodes so we can test UI
	ctx.addNode(TrigNode, 20, 100);
	ctx.addNode(ABMathNode, 220, 100);
	ctx.addNode(ABCompareNode, 400, 100);
	ctx.addNode(RoundNode, 580, 100);
	ctx.addNode(TrigNode, 760, 100);
	ctx.addNode(ClampValueNode, 940, 100);
	ctx.addNode(MapRangeNode, 1120, 100);
	ctx.addNode(LerpValueNode, 1300, 100);

	// window.atn = ctx.addNode(AllTypesNode, 320, 100);
	// window.atn = ctx.addNode(AllTypesNode, 320, 300);
	window.atnOut = ctx.addNode(AllTypesOutNode, 20, 340);

	// add event listener to window, such that if 'home' is pressed, we set ctx.zoomScale.value = 1;
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Home') {
			ctx.zoomScale.value = 1;
			ctx.panX.value = 0;
			ctx.panY.value = 0;
		}
	});
});


/**
 * Disables the context menu from appearing
 * @param {MouseEvent} e - The mouse event that triggered this function
 */
function disableContextMenu(e) {

	// allow normal behavior if shift key is pressed
	if (e.shiftKey)
		return;

	// disable the context menu
	e.preventDefault();
}	

</script>
<style lang="scss" scoped>

	// box to test positioning / layout of our component
	.positioning-box {

		// fill the parent container
		// position: absolute;
		// top: 30px;
		// left: 60px;
		// width: 1000px;
		// height: 800px;

		position: fixed;
		inset: 0px 0px 0px 0px;
	}

	// .positioning-box

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
