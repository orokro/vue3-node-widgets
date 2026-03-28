<!--
	NodeBucketCanvas.vue
	--------------------

	The Node Bucket paint harness.

	Provides a canvas that, when clicked, evaluates the current node graph
	for every pixel and paints the result.  The graph is compiled into a
	pure per-pixel closure via graph.getComputeFunction(), so live field
	state is never mutated during rendering.

	Controls
	  Paint          — re-evaluates the current graph and repaints the canvas
	  Load Default   — deserializes the checker-pattern demo graph into the
	                   currently selected graph slot
	  Canvas click   — same as Paint, but records the mouse position so that
	                   mouseCentric CartesianCoords nodes work correctly
-->
<template>

	<div class="bucket-window">

		<!-- toolbar -->
		<div class="toolbar">
			<div class="tool-btn" @click="paintCanvas" title="Paint canvas with current graph">
				<span>Paint</span>
			</div>
			<div class="tool-btn secondary" @click="loadDefaultGraph" title="Load checker demo graph into current slot">
				<span>Load Default</span>
			</div>
			<span class="status-label">{{ statusText }}</span>
		</div>

		<!-- canvas area fills remaining space -->
		<div class="canvas-area" ref="canvasArea">
			<canvas
				ref="canvas"
				class="bucket-canvas"
				@click="onCanvasClick"
				title="Click to paint"
			></canvas>
		</div>

	</div>

</template>
<script setup>

import { ref, inject, onMounted, onUnmounted } from 'vue';
import defaultCheckerGraph from './defaultCheckerGraph.json';

// Provided by App.vue
const app = inject('app');

const canvas    = ref(null);
const canvasArea = ref(null);
const statusText = ref('Click "Paint" to render the current graph.');

// Last known mouse position inside the canvas (for mouseCentric nodes)
let lastMouseX = 0;
let lastMouseY = 0;


/** Record mouse position and paint on canvas click */
function onCanvasClick(e) {
	const rect = canvas.value.getBoundingClientRect();
	lastMouseX = e.clientX - rect.left;
	lastMouseY = e.clientY - rect.top;
	paintCanvas();
}


/** Compile the graph and paint every pixel */
function paintCanvas() {

	const graph = app?.currentGraph?.value;
	if (!graph) {
		statusText.value = 'No graph loaded.';
		return;
	}

	const fn = graph.getComputeFunction();
	if (!fn) {
		statusText.value = 'Cannot evaluate — ensure the graph has an OutputColor node wired up.';
		return;
	}

	const c   = canvas.value;
	const ctx = c.getContext('2d');
	const w   = c.width;
	const h   = c.height;
	const mouseX = lastMouseX;
	const mouseY = lastMouseY;

	statusText.value = 'Painting…';

	const t0        = performance.now();
	const imageData = ctx.createImageData(w, h);
	const data      = imageData.data;

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const color = fn({ x, y, width: w, height: h, mouseX, mouseY });
			const i = (y * w + x) * 4;
			data[i]     = Math.round(Math.max(0, Math.min(1, color?.r ?? 0)) * 255);
			data[i + 1] = Math.round(Math.max(0, Math.min(1, color?.g ?? 0)) * 255);
			data[i + 2] = Math.round(Math.max(0, Math.min(1, color?.b ?? 0)) * 255);
			data[i + 3] = 255;
		}
	}

	ctx.putImageData(imageData, 0, 0);

	const ms = (performance.now() - t0).toFixed(1);
	statusText.value = `Painted ${w}×${h} in ${ms} ms`;
}


/** Deserialize the built-in checker graph into the currently active graph slot */
function loadDefaultGraph() {

	const graph = app?.currentGraph?.value;
	if (!graph) {
		statusText.value = 'No graph slot available.';
		return;
	}

	try {
		graph.deserialize(defaultCheckerGraph);
		statusText.value = 'Loaded default checker graph — click Paint to render.';
	} catch (e) {
		statusText.value = `Failed to load: ${e.message}`;
		console.error('NodeBucketCanvas: failed to load default graph', e);
	}
}


/** Keep the canvas resolution in sync with its container size */
function syncCanvasSize() {
	if (!canvasArea.value || !canvas.value) return;
	canvas.value.width  = canvasArea.value.clientWidth  || 400;
	canvas.value.height = canvasArea.value.clientHeight || 300;
}

const resizeObserver = new ResizeObserver(syncCanvasSize);

onMounted(() => {
	resizeObserver.observe(canvasArea.value);
	syncCanvasSize();
});

onUnmounted(() => {
	resizeObserver.disconnect();
});

</script>
<style lang="scss" scoped>

	.bucket-window {

		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;

		background: #1c1c1c;
		color: #ddd;

		// ---- toolbar ----
		.toolbar {

			flex: 0 0 auto;
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 5px 8px;
			background: #272727;
			border-bottom: 1px solid #3a3a3a;

			.tool-btn {

				padding: 3px 10px;
				border-radius: 4px;
				background: #444;
				cursor: pointer;
				user-select: none;

				span {
					font-size: 12px;
					color: #ddd;
				}

				&:hover  { background: #5a5a5a; }
				&:active { background: #777; }

				&.secondary {
					background: #333;
					span { color: #aaa; }
					&:hover  { background: #484848; }
				}
			}

			.status-label {
				margin-left: 4px;
				font-size: 11px;
				color: #888;
				flex: 1;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		// ---- canvas area ----
		.canvas-area {

			flex: 1;
			overflow: hidden;
			position: relative;

			.bucket-canvas {
				display: block;
				width: 100%;
				height: 100%;
				cursor: crosshair;
				background: #111;
			}
		}

	} // .bucket-window

</style>
