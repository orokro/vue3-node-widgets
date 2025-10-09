<!--
	Wire.vue
	--------

	One of the wires in the graph. This is a simple component that renders a wire between two nodes.
-->
<template>

	<div
		class="wire-container"
		:class="{
			// if the wire is being deleted, add a class to fade it out
			'destroyed-fade-out': props.wire.isBeingDestroyed.value,
		}"

		:style="{
			// position the wire container absolutely, based on the start position of the wire
			left: `${SVGDetails.viewBoxX}em`,
			top: `${SVGDetails.viewBoxY}em`,
			width: `${(SVGDetails.width)}em`,
			height: `${(SVGDetails.height)}em`,
		}"
	>
		
		<!-- SVG with the wire -->
		<svg 
			class="wire-svg" 
			:viewBox="SVGDetails.viewBox"			
			pointer-events="none"
		>
			<path 
				:d="SVGDetails.pathData" 
				stroke="white" 
				stroke-width="" 
				fill="none"
			/>
		</svg>
		<div 
			v-if="showWireIDs"
			class="wire-id"
		>
			{{ props.wire.id }}
		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, watch, inject } from 'vue';

// props
const props = defineProps({

	// the graph we're in
	graph: {
		type: Object,
		required: true,
	},

	// the wire object to render
	wire: {
		type: Object,
		required: true,
	},

});

// get our component socket position store
const socketPositions = inject('socketPositions');

// debug toggle
// TODO: move to a global debug settings flags object
const showWireIDs = ref(false);

// get our current viewport details
const viewport = inject('viewport');


/**
 * Get the position of a socket on a node
 * 
 * @param {NWNode} node - the node object
 * @param {Object} field - the field object from the node
 * @param {String} kind - 'input' or 'output'
 * @returns {Object|null} - { x, y } position of the socket in em units, or null if not found
 */
function getSocketPos(node, field, kind){

	// gtfo if missing data
	if(!node || !field || !kind)
		return null;

	// get our current zoom scale
	const zoom = viewport.zoomScale.value;

	// get node pos
	const nodeX = node?.x?.value || 0;
	const nodeY = node?.y?.value || 0;

	// get the recorded top and right offsets for this socket
	const measuredPos = socketPositions.get(`${node.id}::${field.id}`) || { 
		top: 0,
		right: 0,
	};

	const pos = {
		x: (nodeX + (kind=='input' ? 0 : measuredPos.right))  * zoom,
		y: (nodeY + measuredPos.top + 25) * zoom,
	}
	return pos;
}


function getWirePositions(wire){

	// first get the reactive positions on the wire itself
	const {
		startX,
		startY,
		endX,
		endY,
	} = wire.positions;

	// next, attempt to see if we can get the positions of the sockets
	const inSockPos = getSocketPos(props.wire.ends.inputNode, props.wire.inputField, 'output');
	const outSockPos = getSocketPos(props.wire.ends.outputNode, props.wire.outputField, 'input');

	// if they aren't null, replace them on the wire
	if(inSockPos){
		wire.lastPositions.startX = inSockPos.x / viewport.zoomScale.value;
		wire.lastPositions.startY = inSockPos.y / viewport.zoomScale.value;
	}
	if(outSockPos){
		wire.lastPositions.endX = outSockPos.x / viewport.zoomScale.value;
		wire.lastPositions.endY = outSockPos.y / viewport.zoomScale.value;
	}

	// return updated positions
	return {
		startX: inSockPos ? wire.lastPositions.startX : startX,
		startY: inSockPos ? wire.lastPositions.startY : startY,
		endX: outSockPos ? wire.lastPositions.endX : endX,
		endY: outSockPos ? wire.lastPositions.endY : endY,
	};
}


// generate the SVG details for the wire
const SVGDetails = computed(()=>{

	// for now we'll just reference the built in positions
	let {
		startX,
		startY,
		endX,
		endY,
	} = getWirePositions(props.wire);

	// get te width and height of the start/end points
	let width = Math.abs(endX - startX);
	let height = Math.abs(endY - startY);

	// get third width for generating the control points
	const controlPointWidth = (width / 3) * 1.5;

	// now, if the start is to the left of the end, we want the control points to be to the right of the start and to the left of the end
	let controlPoint1X = startX + controlPointWidth;
	let controlPoint2X = endX - controlPointWidth;

	// control points Y will be the same as start and end Y
	let controlPoint1Y = startY;
	let controlPoint2Y = endY;

	const padding = 10;

	// now that we have the control points and the start/end positions
	// let's calculate the viewbox for the SVG
	// because the control points can be outside the start/end positions
	// we need to calculate the min and max X and Y values
	const minX = Math.min(startX, endX, controlPoint1X, controlPoint2X);
	const maxX = Math.max(startX, endX, controlPoint1X, controlPoint2X);
	const minY = Math.min(startY, endY, controlPoint1Y, controlPoint2Y);
	const maxY = Math.max(startY, endY, controlPoint1Y, controlPoint2Y);
	const viewBoxWidth = (maxX - minX) + (padding * 2);
	const viewBoxHeight = (maxY - minY) + (padding * 2);

	// now that we've computed the viewbox, adjust the start, end, and control points to be relative to the viewbox
	startX = startX - minX + padding;
	startY = startY - minY + padding;
	endX = endX - minX + padding;
	endY = endY - minY + padding;
	controlPoint1X = controlPoint1X - minX + padding;
	controlPoint1Y = controlPoint1Y - minY + padding;
	controlPoint2X = controlPoint2X - minX + padding;
	controlPoint2Y = controlPoint2Y - minY + padding;
	width = maxX - minX + (padding * 2);
	height = maxY - minY + (padding * 2);

	// compute the top-left corner of the viewbox
	const viewBoxX = minX - padding;
	const viewBoxY = minY - padding;

	// make the svg path and viewbox string
	const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
	const viewBox = `${0} ${0} ${viewBoxWidth} ${viewBoxHeight}`;

	// exit early for now, until we have a better way to handle deleted nodes/ports
	return {
		pathData,
		viewBox,
		viewBoxX,
		viewBoxY,
		width,
		height,
		startX,
		startY,
		endX,
		endY,
		controlPoint1X,
		controlPoint1Y,
		controlPoint2X,
		controlPoint2Y,
	};

});
	
</script>
<style lang="scss" scoped>

	// the div in em size that positioned and scales with zoom
	.wire-container {

		// for debug
		/* border: 1px solid cyan; */
		pointer-events: none;
		
		// fixed positioning
		position: absolute;

		// debug wire-id label
		.wire-id {

			// center in container
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateY(-50%) translateX(-50%);

			// text styles
			font-size: 8em;
			color: rgba(255,255,255,0.8);
			pointer-events: none;
			user-select: none;

			// gray pill shaped
			background: rgba(0,0,0,0.5);
			border-radius: 50em;
			padding: 1em;

		}// .wire-id

		// the actual SVG
		.wire-svg {

			/* border: 1px solid red; */
			line-height: initial;

			// fade out when destroyed
			opacity: 1;
			transform: scaleX(1);
			transition: 
				opacity 0.17s linear,
				transform 0.17s linear;
			
			// css styles for the wire path
			path {
				stroke: var(--nw-wire-color);
				stroke-width: calc(var(--nw-wire-width) * 0.1em);
			}
			
		}// .wire-svg

		&.destroyed-fade-out {
			.wire-svg {
				opacity: 0;
				transform: scaleX(0.9);
			}
		}

	}// .wire-container

</style>
