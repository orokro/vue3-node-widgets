<!--
	Socket.vue
	----------

	This will be the component that renders a socket - either input OR output
	for a node.
-->
<template>

	<div
		:ref="getElRef()"
		class="socket"
		:class="{
			'socket-input': socketType === FIELD_TYPE.INPUT,
			'socket-output': socketType === FIELD_TYPE.OUTPUT,
		}"
		:style="{
			top: `${y}em`,
		}"
		@mousedown="onMouseDown"
	>	
		<div
			v-if="socketFormat === 'corner'"
			class="corner-socket"
			:style="cornerStyle"
		/>		
		<div
			v-else="socketFormat === 'svg'"
		>
		</div>
	</div>

</template>
<script setup>

// vue imports
import { ref, onMounted, computed, shallowRef, watch } from 'vue';

import { FIELD_TYPE, NODE_TYPE } from '@/classes/NWNode';

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
		default: 'R,R,R,R,0'
	},
});

// ref to the socket element
const elRef = ref(null);

// either 'corner' or 'svg' or 'unknown'
const socketFormat = ref('unknown');

// if 'corner' format, this will hold the generated style object
const cornerStyle = shallowRef({});

// when we mount we should figure out how to render this socket
onMounted(() => {

	// set the element reference in the node's field state
	// setElRef();

	// configure our socket style
	buildSocketStyle();
});


function getElRef(){

	const fieldName = props.field.name;
	const fieldState = props.node.fieldState[fieldName];

	return props.socketType === FIELD_TYPE.INPUT
		? fieldState.data.inputSocketEl
		: fieldState.data.outputSocketEl;
}

/**
 * Sets the element reference in the node's field state for this socket
 */
function setElRef(){

	const fieldName = props.field.name;
	const fieldState = props.node.fieldState[fieldName];

	if(props.socketType === FIELD_TYPE.INPUT){
		fieldState.data.inputSocketEl = elRef.value;
	}else if(props.socketType === FIELD_TYPE.OUTPUT){
		fieldState.data.outputSocketEl = elRef.value;
	}
}


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
		cornerStyle.value = generateCornerStyle(props.socketStyle, themeColor);

	} else if (socketFormat.value === 'svg') {
		if (!validateSvgPath(props.socketStyle)) {
			console.warn(`Invalid SVG path for socket ${props.field.name}: ${props.socketStyle}`);
		}
	} else {
		console.warn(`Unknown style format for socket ${props.field.name}: ${props.socketStyle}`);
	}
}


/**
 * Checks if a style string (from the prop) is in the C,C,C,C,Degrees format
 * 
 * @param input - the input string to check
 * @returns {boolean} - true if the input is in corner format, false otherwise
 */
function isCornerFormat(input) {
	// Corner format: 5 segments, 4 of R/S, last is number
	return /^[RS](?:,[RS]){3},-?\d+(\.\d+)?$/.test(input.trim());
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
 * Validates the style string based on its detected format
 * 
 * @param input - the input string to validate
 * @returns {boolean} - true if valid, false otherwise
 */
function validateCornerFormat(input) {

	// we can give it benefit of the doubt and make it uppercase
	input = input.toUpperCase();

	// split on commas and check length
	const parts = input.trim().split(',');
	if (parts.length !== 5)
		return false;

	// break out the parts
	const [tl, tr, br, bl, deg] = parts;
	const corners = [tl, tr, br, bl];

	// Corners must be 'R' or 'S'
	if (!corners.every(c => c === 'R' || c === 'S')) return false;

	// Degrees must be a valid number
	return !isNaN(parseFloat(deg));
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
 * @param input - the input string in C,C,C,C,Degrees format
 * @param themeColor - optional theme color for the background
 * @returns {Object} - style object with background color, border radius, and rotation
 */
function generateCornerStyle(input, themeColor = '#000') {
	
	const parts = input.trim().split(',');
	if (parts.length !== 5) return {};

	const [tl, tr, br, bl, deg] = parts;
	const degrees = parseFloat(deg) || 0;

	// Convert "R" or "S" to CSS border-radius values
	const cornerMap = (corner) => (corner === 'R' ? '50%' : '20%');

	const borderRadius = `${cornerMap(tl)} ${cornerMap(tr)} ${cornerMap(br)} ${cornerMap(bl)}`;

	return {
		background: themeColor,
		borderRadius: borderRadius,
		transform: `translate(-50%, -50%) rotate(${degrees}deg)`,
	};
}


function onMouseDown(event) {
	// Placeholder for future drag-and-drop functionality
	// props.nwSystem.startWire(props.node, props.field, socketType, $event)

	console.log(props.node, props.field, props.socketType);
}

</script>
<style lang="scss" scoped>

	.socket {

		width: 1px;
		height: 1px;
		/* border: 1px solid red; */

		position: absolute;
		cursor: move;

		// the simple socket style that just specifies corners & rotation
		.corner-socket {

			transform: translate(-50%, -50%) rotate(0deg);

			display: inline-block;
			width: 14em;
			height: 14em;
			
			border: 2em solid black;

			transform-origin: center;
		}// .corner-socket


		&.socket-input {
			left: 0px;
		}
		&.socket-output {
			right: 0px;
		}

	}// .socket

</style>
