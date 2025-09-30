<!--
	SineScreen.vue
	--------------

	Shows a customizable Sine wave
-->
<template>

	<!--
		Outer wrapper div (transparent) that can receive positioning/styles/attrs from parents.
		Contains a single <canvas> where we draw everything.
	-->
	<div 
		class="sine-screen" 
		v-bind="$attrs"
		@mousedown="startScreenDrag"
	>
		<canvas
			ref="canvasEl"
			:width="width"
			:height="height"
			class="sine-canvas"
			aria-label="Sine wave canvas"
		></canvas>
	</div>

</template>
<script setup>

// vue
import { ref, watch, onMounted, computed, inject } from 'vue';

/**
 * Component props
 * ----------------
 * width:		fixed canvas width (px)
 * height:		fixed canvas height (px)
 * amplitude:	amplitude of the sine wave. If >1, y-axis labels expand to [-amplitude, +amplitude] but the curve is clamped to fit the window.
 * wavelength:	scales the horizontal spacing; every 90° is xscale * wavelength pixels, and the curve uses the same horizontal scale.
 * xscale:		number of pixels that represent 90 degrees when wavelength===1.
 * degrees:		if true, x-axis labels use degrees (0°, 90°, 180°...); if false, labels use radians in π units (0π, 0.5π, 1π...).
 * color:		pen color for axes, ticks, labels, and the curve.
 */
const props = defineProps({
	xOffset: { type: Number, default: 0 },
	width: { type: Number, default: 600 },
	height: { type: Number, default: 300 },
	amplitude: { type: Number, default: 1 },
	wavelength: { type: Number, default: 1 },
	xscale: { type: Number, default: 80 }, // pixels per 90° at wavelength === 1
	degrees: { type: Boolean, default: true },
	color: { type: String, default: '#0f172a' } // slate-900-ish
});


// get our drag helper for latter use
const dh = inject('dh');

const emit = defineEmits(['update:xOffset']);

// local backing state so dragging works even without v-model
const internalXOffset = ref(props.xOffset);

// sync with parent if prop changes
watch(() => props.xOffset, (val) => {
	internalXOffset.value = val;
});

// Local proxy that syncs prop <-> internal writes
const xOffsetProxy = computed({
	get: () => internalXOffset.value,
	set: (val) => {
		internalXOffset.value = val;
		emit('update:xOffset', val);
	}
});


/**
 * Expose the internal xOffset so a parent can update it programmatically.
 * This keeps the source of truth inside the component, while allowing external control.
 */
defineExpose({ xOffsetProxy });


/**
 * Canvas element ref and 2D context
 */
const canvasEl = ref/** @type {HTMLCanvasElement|null} */(null);


/**
 * Derived, frequently-used values
 */
const midY = computed(() => props.height / 2);


/** Number of pixels per 90 degrees after applying wavelength */
const pxPer90 = computed(() => Math.max(1, props.xscale * props.wavelength)); // guard against 0 or negative


/** Horizontal radians per pixel; independent of label mode */
const radiansPerPixel = computed(() => {
	// 90° == π/2 radians corresponds to pxPer90 pixels
	// => (π/2) radians / pxPer90 pixels = radians per pixel
	return (Math.PI / 2) / pxPer90.value;
});


/** The vertical label range (does not change vertical mapping of 0 baseline) */
const yLabelMax = computed(() => Math.max(1, Math.abs(props.amplitude)));


/** The curve's visual amplitude factor to always fit within the window */
const visualAmplitude = computed(() => Math.min(1, Math.abs(props.amplitude)));


/**
 * Drawing helpers
 * ---------------
 * Everything is drawn in a single pass when any dependency changes.
 * There is no requestAnimationFrame loop as requested.
 */

/**
 * Clear the canvas to a fully transparent background.
 * @param {CanvasRenderingContext2D} ctx
 */
function clearCanvas(ctx) {
	// Transparent clear
	ctx.clearRect(0, 0, props.width, props.height);
}


/**
 * Convert a canvas Y (with 0 at top) to a normalized graph value and vice versa.
 * We keep 0 at vertical middle, and map [-1..+1] visually, regardless of label range.
 * The curve's vertical size uses `visualAmplitude`.
 *
 * @param {number} valueNormalized	A value in [-1..+1] where +1 is top and -1 is bottom? No:
 * 									We define +1 as the top deviation magnitude, but canvas Y increases downward.
 * 									So y = midY - (valueNormalized * (midY - padding)).
 * @returns {number} Canvas Y
 */
function toCanvasY(valueNormalized) {
	// Small padding so ticks/labels don't clip the edges
	const padding = 10;
	const halfRange = (props.height / 2) - padding;
	return midY.value - (valueNormalized * halfRange);
}


/**
 * Draw axes (X through center, Y at world X=0) and tick marks with labels.
 * The X axis is always at y=0 (center). The Y axis position depends on xOffsetProxy (it "scrolls" with content).
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawAxesAndTicks(ctx) {
	
	ctx.save();
	ctx.strokeStyle = props.color;
	ctx.fillStyle = props.color;
	ctx.lineWidth = 1;

	// ----- X Axis (horizontal through y = 0) -----
	ctx.beginPath();
	ctx.moveTo(0, midY.value);
	ctx.lineTo(props.width, midY.value);
	ctx.stroke();

	// Tick size in px
	const tickSize = 6;
	ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';

	// ----- X Ticks & Labels -----
	// World-to-canvas mapping:
	// worldX = k * pxPer90
	// canvasX = worldX - xOffsetProxy
	// For all integers k s.t. canvasX ∈ [0, width], place a tick.
	const S = pxPer90.value;
	if (S > 0) {

		const kStart = Math.floor((xOffsetProxy.value) / S) - 1; // extend one step out to ensure coverage
		const kEnd = Math.ceil((xOffsetProxy.value + props.width) / S) + 1;

		for (let k = kStart; k <= kEnd; k++) {
			const worldX = k * S;
			const canvasX = worldX - xOffsetProxy.value;
			if (canvasX < -S || canvasX > props.width + S) continue;

			// Tick
			ctx.beginPath();
			ctx.moveTo(canvasX, midY.value - tickSize / 2);
			ctx.lineTo(canvasX, midY.value + tickSize / 2);
			ctx.stroke();

			// Label every tick (0, 90°, 180°...) with degree or π notation
			const label = formatXLabel(k);
			ctx.fillText(label, canvasX, midY.value + tickSize / 2 + 2);
		
		}// next k
	}

	// ----- Y Axis (vertical at worldX=0) -----
	// canvasX for y-axis is 0 - xOffsetProxy
	const yAxisX = -xOffsetProxy.value;
	if (yAxisX >= 0 && yAxisX <= props.width) {

		// Y axis line
		ctx.beginPath();
		ctx.moveTo(yAxisX, 0);
		ctx.lineTo(yAxisX, props.height);
		ctx.stroke();

		// Y ticks & labels at integers between [-yLabelMax, +yLabelMax]
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
		const maxLabel = yLabelMax.value;
		const minTick = Math.ceil(-maxLabel);
		const maxTick = Math.floor(maxLabel);

		for (let v = minTick; v <= maxTick; v++) {
			// Skip 0 tick label on y-axis to avoid clutter with x-axis crossing; draw tick though
			const yCanvas = toCanvasY(v / maxLabel); // normalized to [-1..+1] for positioning
			// Tick mark
			ctx.beginPath();
			ctx.moveTo(yAxisX - tickSize / 2, yCanvas);
			ctx.lineTo(yAxisX + tickSize / 2, yCanvas);
			ctx.stroke();

			// Label (avoid labeling 0 right on the axis if it collides with x-axis)
			if (v !== 0) {
				ctx.fillText(String(v), yAxisX - tickSize - 2, yCanvas);
			}
		}

		// Draw "0" near the origin but offset a bit to reduce overlap
		const zeroY = toCanvasY(0);
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillText('0', yAxisX + tickSize + 2, zeroY + 2);
	}

	ctx.restore();
}


/**
 * Format the X-axis label for a tick index k, where each tick is 90° apart.
 * k=0 -> 0° or 0π
 * k=1 -> 90° or 0.5π
 * k=2 -> 180° or 1π
 * etc.
 * @param {number} k
 * @returns {string}
 */
function formatXLabel(k) {
	if (props.degrees) {
		return `${k * 90}°`;
	}
	// Radians in π units at 90° increments -> k * 0.5π
	const halfPiUnits = k * 0.5;

	// Keep a compact representation (avoid trailing .0 when possible)
	const str = Number.isInteger(halfPiUnits) ? String(halfPiUnits) : String(halfPiUnits);
	return `${str}π`;
}


/**
 * Draw the sine curve using the current settings.
 * The curve scrolls horizontally with xOffsetProxy, and uses the same horizontal scale as the tick spacing.
 * Vertically, the curve always fits inside [-1, +1] visually, scaled by `visualAmplitude`.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawSine(ctx) {
	ctx.save();
	ctx.strokeStyle = props.color;
	ctx.lineWidth = 2;

	ctx.beginPath();

	// Start at x=0
	let first = true;
	for (let x = 0; x <= props.width; x++) {

		// worldX is the scrolled coordinate
		const worldX = x + xOffsetProxy.value;

		// Convert to radians via radiansPerPixel
		const theta = worldX * radiansPerPixel.value;

		// Compute normalized y in [-1..+1] and apply visual amplitude clamp
		const yNorm = Math.sin(theta) * visualAmplitude.value;
		const yCanvas = toCanvasY(yNorm);

		if (first) {
			ctx.moveTo(x, yCanvas);
			first = false;
		} else {
			ctx.lineTo(x, yCanvas);
		}
	}

	ctx.stroke();
	ctx.restore();
}


/**
 * Master draw routine: clears and redraws axes, ticks, labels, then the sine curve.
 * @returns {void}
 */
function drawAll() {
	const el = canvasEl.value;
	if (!el) return;
	const ctx = el.getContext('2d');
	if (!ctx) return;

	clearCanvas(ctx);
	drawAxesAndTicks(ctx);
	drawSine(ctx);
}


/**
 * Watchers & lifecycle
 * --------------------
 * We redraw when relevant props or the xOffsetProxy ref changes.
 */
onMounted(() => {
	drawAll();
});


// Redraw on any relevant change (no rAF loop)
watch(
	() => [
		props.width,
		props.height,
		props.amplitude,
		props.wavelength,
		props.xscale,
		props.degrees,
		props.color,
		xOffsetProxy.value
	],
	drawAll,
	{ flush: 'post' }
);


/**
 * Start a drag operation to adjust xOffsetProxy (horizontal scroll).
 * 
 * @param {MouseEvent} e - the mousedown event
 */
function startScreenDrag(e){

	// save initial offset
	const initialOffset = xOffsetProxy.value;
	
	// do the drag operation
	dh.dragStart(

		(dx, dy)=>{
			// on drag, update the xOffsetProxy
			xOffsetProxy.value = initialOffset + dx;
		},
		(dx, dy)=>{
			// on drag end, nothing to do
		},
	)
}


</script>
<style lang="scss" scoped>

	/* Main container */
	.sine-screen {

		// Transparent container that accepts external positioning/styles
		display: inline-block;

		// Prevent accidental text selection while interacting nearby
		user-select: none;
		
		// look draggable
		cursor: ew-resize;

		// the canvas inside
		.sine-canvas {

			pointer-events: none;
			
			// Ensure the canvas itself is transparent
			background: transparent;

			// Crisp drawing on many displays; parent may override
			image-rendering: -webkit-optimize-contrast;

			// Keep pointer simple; no interactions are defined here
			cursor: default;

			// Hard size based on props width/height; canvas attributes control resolution
			display: block;

		}// .sine-canvas

	}// .sine-screen

</style>
