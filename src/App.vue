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
	MapRangeNode,
	LerpValueNode,
	RoundNode,
	TrigNode,
	
	AllTypesNode,
	AllTypesOutNode,

	V2ScaleNode,
	V2AddNode,
	V2SubNode,
	V2DotNode,
	V2SeparateXYNode,
	V2CombineXYNode,

	V3ScaleNode,
	V3AddNode,
	V3SubNode,
	V3DotNode,
	V3SeparateXYZNode,
	V3CombineXYZNode,

	ColorMixNode,
	ColorBlendNode,
	SeparateAlpha,
	SeparateHSVNode,
	SeparateRGBNode,
	CombineRGBNode,
	CombineRGBANode,
	CombineHSVNode,

	RandomColorNode,
	RandomNumberNode,
	RandomV2Node,
	RandomV3Node,
	RandomBoolNode,

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

	// next row is vector 2
	ctx.addNode(V2ScaleNode, 220, 400);
	ctx.addNode(V2AddNode, 400, 400);
	ctx.addNode(V2SubNode, 580, 400);
	ctx.addNode(V2DotNode, 760, 400);
	ctx.addNode(V2SeparateXYNode, 940, 400);
	ctx.addNode(V2CombineXYNode, 1120, 400);

	// next row is vector 3
	ctx.addNode(V3ScaleNode, 220, 600);
	ctx.addNode(V3AddNode, 400, 600);
	ctx.addNode(V3SubNode, 580, 600);
	ctx.addNode(V3DotNode, 760, 600);
	ctx.addNode(V3SeparateXYZNode, 940, 600);
	ctx.addNode(V3CombineXYZNode, 1120, 600);

	// next row is random things
	ctx.addNode(RandomColorNode, 220, 800);
	ctx.addNode(RandomNumberNode, 400, 800);
	ctx.addNode(RandomV2Node, 580, 800);
	ctx.addNode(RandomV3Node, 760, 800);
	ctx.addNode(RandomBoolNode, 940, 800);

	// next row is color nodes
	ctx.addNode(ColorMixNode, 220, 1040);
	ctx.addNode(ColorBlendNode, 400, 1040);
	ctx.addNode(SeparateAlpha, 580, 1040);
	ctx.addNode(SeparateHSVNode, 760, 1040);
	ctx.addNode(SeparateRGBNode, 940, 1040);
	ctx.addNode(CombineRGBNode, 1120, 1040);
	ctx.addNode(CombineRGBANode, 1300, 1040);
	ctx.addNode(CombineHSVNode, 1480, 1040);



	// window.atn = ctx.addNode(AllTypesNode, 320, 100);
	// window.atn = ctx.addNode(AllTypesNode, 320, 300);
	window.atnOut = ctx.addNode(AllTypesOutNode, 20, 400);

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
