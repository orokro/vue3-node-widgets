<!--
	Socket.vue
	----------

	This will be the component that renders a socket - either input OR output
	for a node.
-->
<template>

	<div
		class="socket"
		:class="[
			`${node.id}_${field.id}_${socketType}`,
			{
				'socket-input': socketType === FIELD_TYPE.INPUT,
				'socket-output': socketType === FIELD_TYPE.OUTPUT,
			}
		]"
		:style="{
			top: `${y}em`,
		}"
		:title="`${field.name} (${field.valueType.name})`"
		@mousedown="onMouseDown"
		@mouseover="onMouseOver"
		@mouseleave="onMouseLeave"
	>	
		<div
			v-if="socketFormat === 'corner'"
			class="corner-socket"
			:style="cornerStyle"
		/>		
		<div
			v-else-if="socketFormat === 'svg'"
		>
		</div>
	</div>

</template>
<script setup>

// vue imports
import { ref, onMounted, onUnmounted, computed, shallowRef, watch, inject, watchEffect } from 'vue';

import { FIELD_TYPE, NODE_TYPE, SOCKET_TYPE } from '@/classes/NWNode';

// props
const props = defineProps({

	// the y position of the socket
	y: {
		type: Number,
		default: 0
	},

	// the node this socket belongs to
	node: {
		type: Object,
		required: true
	},

	// the graph this node belongs to
	graph: {
		type: Object,
		required: true
	},

	// the field this widget is for
	field: {
		type: Object,
		required: true
	},

	// the socket type - input or output
	socketType: {
		type: String,
		required: true
	},

	// the string that stores the style of the socket
	socketStyle: {
		type: String,
		default: '10,10,10,10'
	},
});

// get our graph context
const ctx = inject('ctx').value;

// get our reusable drag helper
const dh = inject('dh');

// get our viewport context objects
const viewport = inject('viewport');

// either 'corner' or 'svg' or 'unknown'
const socketFormat = ref('unknown');

// if 'corner' format, this will hold the generated style object
const cornerStyle = shallowRef({});

// get the cursor popup element
const cursorPopupEl = inject('cursorPopupEl');

// get context for our connection logic
const eventCtx = computed(()=>{
	return {
		editor: ctx,
		viewport,
		dh,
		graph: props.graph,
		node: props.node,
	};
});


// when we mount we should figure out how to render this socket
let we = null;
onMounted(() => {

	// configure our socket style
	watchEffect(() => {
		buildSocketStyle();
	});
});


// clean up on unmount
onUnmounted(() => {
	if (we)
		we();
});


/**
 * Builds the socket style based on the socketStyle prop
 */
function buildSocketStyle(){

	// detect the format of the style string
	socketFormat.value = detectStyleFormat(props.socketStyle);
	
	// validate the style string based on its format
	if (socketFormat.value === 'corner') {
		if (!validateCornerFormat(props.socketStyle)) {
			console.warn(`Invalid corner format for socket ${props.field.name}: ${props.socketStyle}`);
			return;
		}
		
		// generate the corner style
		const themeColor = (props.field.valueType.themeColor);
		cornerStyle.value = generateCornerStyle(props.socketStyle, themeColor, props.field.isArray);

	} else if (socketFormat.value === 'svg') {

		if (!validateSvgPath(props.socketStyle))
			console.warn(`Invalid SVG path for socket ${props.field.name}: ${props.socketStyle}`);
		
	} else {
		console.warn(`Unknown style format for socket ${props.field.name}: ${props.socketStyle}`);
	}
}


/**
 * Checks if a style string (from the prop) is in the 0–10 corner format
 * 
 * @param input - the input string to check
 * @returns {boolean} - true if the input is in corner format, false otherwise
 */
function isCornerFormat(input) {

	// Corner format: 4 numbers 0–10
	return /^([0-9]|10)(,([0-9]|10)){3}$/.test(input.trim());
}


/**
 * Checks if a style string (from the prop) is in the SVG path format
 * 
 * @param input - the input string to check
 * @returns {boolean} - true if the input is in SVG path format, false otherwise
 */
function isSvgPathFormat(input) {

	// Basic SVG path: Must start with M and end with Z
	return /^M[\s\d\.\-\,CQLHVSAZT]+Z$/i.test(input.trim());
}


/**
 * Detects the style format of the input string
 * 
 * @param input - the input string to check
 * @returns {string} - 'corner' if in corner format, 'svg' if in SVG path format, 'unknown' otherwise
 */
function detectStyleFormat(input) {

	if (isCornerFormat(input)) return 'corner';
	if (isSvgPathFormat(input)) return 'svg';
	return 'unknown';
}


/**
 * Validates the corner style string (0–10 system)
 * 
 * @param input - the input string to validate
 * @returns {boolean} - true if valid, false otherwise
 */
function validateCornerFormat(input) {

	const parts = input.trim().split(',');
	if (parts.length !== 4)
		return false;

	// Ensure each part is a number between 0 and 10
	return parts.every(p => {
		const num = parseFloat(p);
		return !isNaN(num) && num >= 0 && num <= 10;
	});
}


/**
 * Validates the SVG path string
 * 
 * @param path - the SVG path string to validate
 * @returns {boolean} - true if valid, false otherwise
 */
function validateSvgPath(path) {

	const trimmed = path.trim();

	// Must start with M and end with Z
	if (!/^M/i.test(trimmed) || !/Z$/i.test(trimmed)) return false;

	// Check that M has 2 numbers after it
	const moveMatch = trimmed.match(/^M\s*([-\d\.]+)\s+([-\d\.]+)/i);
	if (!moveMatch) return false;

	// Check that all C commands have 6 numbers after them
	const curveCommands = trimmed.match(/C\s*([-\d\.]+\s+){5}[-\d\.]+/gi);
	if (curveCommands) {
		for (const cmd of curveCommands) {
			const nums = cmd.match(/[-\d\.]+/g);
			if (!nums || nums.length !== 6) return false;
		}
	}

	// Rough validation passed
	return true;
}


/**
 * Generates the style object for a corner socket based on the input string
 * 
 * @param input - the input string in N,N,N,N format (0–10)
 * @param themeColor - optional theme color for the background
 * @param isArray - whether the field is an array (to adjust size)
 * @returns {Object} - style object with background color, border radius, etc.
 */
function generateCornerStyle(input, themeColor = '#000', isArray) {
	
	const parts = input.trim().split(',');
	if (parts.length !== 4) return {};

	const [tl, tr, br, bl] = parts.map(v => Math.min(Math.max(parseFloat(v) || 0, 0), 10));

	// Map 0–10 -> 0em–7em
	const toRadius = (v) => `${(v / 10) * 7}em`;

	const borderRadius = `${toRadius(tl)} ${toRadius(tr)} ${toRadius(br)} ${toRadius(bl)}`;
	const baseWidth = '14em';
	const baseHeight = isArray ? '28em' : '14em';

	return {
		background: themeColor,
		borderRadius: borderRadius,
		width: baseWidth,
		height: baseHeight,
		transform: `translate(-50%, -50%)`,
	};
}


/**
 * Starts wire drag process when mouse is pressed down on the socket
 * 
 * @param event - the mouse down event
 */
function onMouseDown(event) {

	// start the wire dragging process
	props.graph.connMgr.startWire(
		eventCtx.value,
		props.node,
		props.field,
		props.socketType == SOCKET_TYPE.OUTPUT,
		event
	);
}


/**
 * Handles mouse over event on the socket
 * 
 * @param event - the mouse over event
 */
function onMouseOver(event) {

	// notify the connection manager that we're hovering over this socket
	props.graph.connMgr.hoverSocket(
		eventCtx.value,
		props.node,
		props.field,
		props.socketType == SOCKET_TYPE.INPUT,
		cursorPopupEl.value
	);
}


/**
 * Handles mouse leave event on the socket
 * 
 * @param event - the mouse leave event
 */
function onMouseLeave(event) {

	// hide the cursor popup if it's showing
	cursorPopupEl.value.hide();

	// notify the connection manager that we're no longer hovering over this socket
	props.graph.connMgr.leaveSocket(
		eventCtx.value,
		props.node,
		props.field,
		props.socketType == SOCKET_TYPE.INPUT
	);
}

</script>
<style lang="scss" scoped>

	.socket {

		width: 1px;
		height: 1px;
		/* border: 1px solid red; */

		position: absolute;
		cursor: move;

		// the simple socket style that just specifies corners
		.corner-socket {

			transform: translate(-50%, -50%);

			display: inline-block;
			width: 14em;
			height: 14em;
			
			border: 2em solid black;

			transform-origin: center;
		}// .corner-socket


		&.socket-input {
			left: 0em;
		}
		&.socket-output {
			right: -0.5em;
		}

	}// .socket

</style>
