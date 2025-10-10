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
			:theme="emptyTheme"
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

const emptyTheme = {};

const customTheme = {
	
	// graph settings

	// background color of the graph body
	graphBGColor: '#EEE',

	// url to image note: not CSS "url('asd')" type property. This will be a raw URL string, that should be converted to appropriate CSS
	graphBGImage: '/img/grid_bg.png',

	// node settings

	// color to use for node outline
	nodeOutlineColor: 'orangered',

	// color to use for selected nodes
	nodeOutlineColorSelected: 'orange',

	// TL TR BR BL, except numbers only, no units, internally converted to EM
	nodeBorderRadius: '10 10 10 10',

	// background color of node by default
	nodeBodyBGColor: '#99ABAE',

	// default font color for contents of a node
	nodeTextColor: 'teal',

	// node title bar settings

	// background color for the title bar of nodes
	nodeTitleBGColor: 'darkorange',

	// text color for title bar
	nodeTitleTextColor: 'brown',

	// delete button rest color
	nodeTitleDeleteButtonColor: '#000000',

	// delete button hover color
	nodeTitleDeleteButtonColorHover: '#9A0E0E',

	// delete button text icon color
	nodeTitleDeleteButtonFGColor: 'red',

	// collapse button rest color
	nodeTitleCollapseButtonBGColor: '#000000',

	// hover color when open
	nodeTitleCollapseButtonOpenHoverColor: '#9A5E0E',

	// hover color when closed
	nodeTitleCollapseButtonClosedColor: '#2F9A0E',

	// collapse button text icon color
	nodeTitleCollapseButtonFGColor: 'lime',

	// node field colors
	nodeFieldTextColor: '#000000',

	// node inputs colors

	// default background color for inputs
	nodeInputBGColor: '#AAAAAA',

	// accent color 1 (used for range & toggles)
	nodeInputAccent1: '#696969',

	// accent color 2 (used or enabled toggles & arrow widgets_)
	nodeInputAccent2: 'indigo',

	// default text color
	nodeInputTextColor: 'yellow',

	// interactive input bg color
	nodeInputBGColorActive: 'lightpink',

	// interactive input text color
	nodeInputTextColorActive: 'red',

	// used for separators on nodes
	nodeInputSeparatorColor: 'indigo',

	// wire settings

	// color for wires between nodes
	// NOTE: in future this may be automatically determined from socket type
	wireColor: 'red',

	// thiccness for wires
	wireWidth: 10,
};

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
