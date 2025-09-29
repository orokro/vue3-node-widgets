<!--
	App.vue
	-------

	Main entry point to the application
-->
<template>
	<main @contextmenu="disableContextMenu">
		<div class="positioning-box">

			<WindowManager
				ref="winMgrEl"
				:availableWindows="availableWindows"
				:defaultLayout="defaultWindowLayout"

				:topBarComponent="HeaderBar"
				:showTopBar="true"
			/>
			
		</div>

	</main>
</template>
<script setup>

// vue
import { ref, onMounted, provide } from 'vue';
import NWEditor from './classes/NWEditor.js';
import WindowManager from 'vue-win-mgr';
import GraphWindow from './dev_src/GraphWindow.vue';
import HeaderBar from './dev_src/HeaderBar.vue';
import { DevApp } from './dev_src/DevApp.js';

// styles
import 'vue-win-mgr/dist/style.css';

// refs
const winMgrEl = ref(null);

// build our list of available windows for the window manager
const availableWindows = [
	{
		title: 'Graph Window',
		window: GraphWindow,
		slug: 'graph',
	}
];

// default layout
const defaultWindowLayout = [
    {
        "name": "window",
        "top": 0,
        "left": 0,
        "bottom": 941,
        "right": 1290
    },
    {
        "name": "frame_0",
        "style": 10,
        "windows": [
            "graph"
        ],
        "top": 0,
        "bottom": 937,
        "left": 0,
        "right": 640
    },
    {
        "name": "frame_2",
        "style": 10,
        "windows": [
            "graph"
        ],
        "top": 0,
        "bottom": 937,
        "left": 640,
        "right": 1290
    }
];


// make new Dev app which will include our NWEditor instance(s)
const app = new DevApp();
window.app = app;

// provide it to the app
provide('app', app);

onMounted(() => {
	
	// for debug, provide our window manager context to console
	const wm = winMgrEl.value;
	const wmCtx = wm.getContext();
	window.wm = wmCtx;

	// add event listener to window, such that if 'home' is pressed, we set ctx.zoomScale.value = 1;
	window.addEventListener('keydown', (e) => {

		if (e.key === 'Home') {
			const ctx = app.currentGraph.value;
			ctx.zoomScale.value = 1;
			ctx.panX.value = 0;
			ctx.panY.value = 0;
		}0
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

	main {
		font-family: sans-serif;
	}

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
