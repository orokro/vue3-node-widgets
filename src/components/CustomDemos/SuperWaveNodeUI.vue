<!--
	SuperWaveNode.vue
	-----------------

	This is a component to demonstrate a custom node type that has completely custom UI.

	So, it wont generate the default field-type UI, and instead, handles 100% of it's own rendering.
-->
<template>

	<div class="super-wave-node">

		<!-- controls for changing amplitude -->
		<div 
			class="number-box amplitude"
			:class="{'disabled': fieldHasInput(props.node.fieldState.amplitude)}"
		>
			<div class="btn minus" @click="amplitude = Math.max(0, amplitude - 0.1)"><span>-</span></div>
			<div class="value" @mousedown="dragAmplitude"><span>{{ amplitude.toFixed(1) }}</span></div>
			<div class="btn plus" @click="amplitude = Math.min(10, amplitude + 0.1)"><span>+</span></div>
		</div>

		<!-- controls for changing wavelength -->
		<div 
			class="number-box wavelength"
			:class="{'disabled': fieldHasInput(props.node.fieldState.wavelength)}"
		>
			<div class="btn minus" @click="wavelength = Math.max(0.01, wavelength - 0.1)"><span>-</span></div>
			<div class="value" @mousedown="dragWavelength"><span>{{ wavelength.toFixed(1) }}</span></div>
			<div class="btn plus" @click="wavelength = Math.min(20, wavelength + 0.1)"><span>+</span></div>
		</div>

		<!-- LED for when we're in degrees mode -->
		<div class="led degrees" :class="{'on': degrees}">
			<div class="led-inner"></div>
		</div>

		<!-- LED for when we're in radians mode -->
		<div class="led radians" :class="{'on': !degrees}">
			<div class="led-inner"></div>
		</div>

		<!-- toggle switch for degrees v radians -->
		<div 
			class="angle-toggle" 
				@click="degrees = !degrees"
			>
			<div
				class="toggle-inner"
				:class="{'degrees': degrees, 'radians': !degrees}"
			/>
		</div>

		<!-- the screen to show the sine wave -->
		<div ref="screenBoxEl" class="screen">
			<SineScreen 
				:width="screenResolutionWidth"
				:height="screenResolutionHeight"
				:amplitude="amplitude"
				:wavelength="wavelength"
				:degrees="degrees"
				:xscale="screenResolutionWidth/6"
				:color="'#aaFF00'"
			/>
		</div>

	</div>
</template>
<script setup>

// vue
import { ref, onMounted, onBeforeUnmount, computed, shallowRef, watch, inject } from 'vue';

// components
import SineScreen from './SineScreen.vue';

// props
const props = defineProps({

	// reference to the NWEditor instance
	nwSystem: {
		type: Object,
		required: true
	},

	// the node instance 
	node: {
		type: Object,
		required: true
	}

});

// get our drag helper for later
const dh = inject('dh');

// refs
const screenBoxEl = ref(null);
const screenResolutionWidth = ref(277);
const screenResolutionHeight = ref(78);

// make the fields reactive for our template
const theta = shallowRef(props.node.fieldState.theta.val);
watch(()=>theta.value, (newVal) => { props.node.fieldState.theta.val = newVal; });

const amplitude = shallowRef(props.node.fieldState.amplitude.val);
watch(()=>amplitude.value, (newVal) => { props.node.fieldState.amplitude.val = newVal; });

const wavelength = shallowRef(props.node.fieldState.wavelength.val);
watch(()=>wavelength.value, (newVal) => { props.node.fieldState.wavelength.val = newVal; });

const degrees = shallowRef(props.node.fieldState.degrees.val);
watch(()=>degrees.value, (newVal) => { props.node.fieldState.degrees.val = newVal; });


// resize observer to keep screen rendering correctly sized
let resizeObserver = null;

// set our socket positions when mounted
onMounted(() => {

	// set our socket positions
	setSocketPositions();

	// watch screen size
	watchScreenSize();
});


// clean up on unmount
onBeforeUnmount(() => {

	// disconnect our resize observer
	if (resizeObserver) {
		resizeObserver.disconnect();
	}
});


/**
 * Set up a resize observer to watch our screen box element, and update our screen resolution refs
 */
function watchScreenSize(){

	// create a resize observer to watch the screen box element
	resizeObserver = new ResizeObserver(entries => {
		for (let entry of entries) {
			if (entry.contentBoxSize) {
				const width = entry.contentRect.width;
				const height = entry.contentRect.height;

				// update our screen resolution refs
				screenResolutionWidth.value = Math.floor(width);
				screenResolutionHeight.value = Math.floor(height);
			}
		}
	});

	// start observing the screen box element
	if (screenBoxEl.value) {
		resizeObserver.observe(screenBoxEl.value);
	}
}


/**
 * Sets the socket positions for our custom node
 */
function setSocketPositions(){

	// input side
	props.node.fieldState.theta.data.inputYPos.value = 20;
	props.node.fieldState.amplitude.data.inputYPos.value = 172;
	props.node.fieldState.wavelength.data.inputYPos.value = 196;

	// output side
	props.node.fieldState.result.data.outputYPos.value = 20;
}


/**
 * Handles dragging to change amplitude
 * 
 * @param {MouseEvent} e - the mouse event
 */
function dragAmplitude(e){

	// save initial value
	const startValue = amplitude.value;

	// start drag
	dh.dragStart(
		(dx, dy)=>{
			// calculate new value
			let newValue = startValue - dx * 0.05;

			// lint it
			newValue = Math.min(10, Math.max(0, newValue));

			// set it
			amplitude.value = newValue;
		},
		(dx, dy) => {
			// on drag end, do nothing for now
		},
	);
}


/**
 * Handles dragging to change wavelength
 * 
 * @param {MouseEvent} e - the mouse event
 */
function dragWavelength(e){

	// save initial value
	const startValue = wavelength.value;

	// start drag
	dh.dragStart(
		(dx, dy)=>{
			// calculate new value
			let newValue = startValue - dx * 0.05;

			// lint it
			newValue = Math.min(20, Math.max(0.1, newValue));

			// set it
			wavelength.value = newValue;
		},
		(dx, dy) => {
			// on drag end, do nothing for now
		},
	);
}


// wires list lives on the editor graph; shallowRef so changes are reactive
const wiresRef = props.nwSystem.graph.wires;


// cache of connected INPUT endpoints, keyed by "nodeId::fieldName"
const connectedInputsKeySet = computed(()=>{

	// force recalc when wires change
	const _ver = props.node.wiresVersion.value;

	// build a set of all connected INPUT endpoints
	const set = new Set();
	for(const c of wiresRef.value){

		// NOTE: a field gets its value when it is the OUTPUT end of a connection
		// (connection.outputNode/outputField is the consumer/input socket)
		if(c?.outputNode && c?.outputField)
			set.add(`${c.outputNode.id}::${c.outputField.name}`);
		
	}// next c

	return set;
});


// true iff THIS node's given field has an INPUT wire
function fieldHasInput(field){

	return connectedInputsKeySet.value.has(`${props.node.id}::${field.name}`);
}


</script>
<style lang="scss" scoped>

	.super-wave-node{

		// for debug
		/* border: 1px solid red; */

		// so we can absolutely position children
		position: relative;

		// fixed size
		width: 322em;
		height: 245em;

		// background image
		background: url('/SuperWave/base_image.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;

		// the boxes that let us change amplitude & wavelength
		.number-box {

			// for debug
			/* border: 1px solid red; */
			/* background: rgba(255, 0, 0, 0.6); */

			// fixed size & pos
			position: absolute;			
			top: 156em;
			width: 120em;
			height: 32em;

			// just the amplitude box
			&.amplitude {
				left: 21em;
			}

			// just the wavelength box
			&.wavelength {
				left: 182em;
			}

			// flex settings for the buttons & display row
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			padding: 0em 4em 0em 4em;

			// the buttons
			.btn {
				width: 28em;
				height: 28em;
				background: #222;
				border: 2em solid black;
				border-radius: 6em;

				// center the text
				display: flex;
				justify-content: center;
				align-items: center;

				// text styles
				span { font-size: 16em;	}
				font-weight: bold;
				color: rgb(129, 129, 129);

				// cursor
				cursor: pointer;

				// user select none
				user-select: none;

				// hover effect
				&:hover {
					background: #444;
				}
			}// .btn

			// the value 
			.value {

				// box settings
				min-width: 50em;
				background: #444;
				box-shadow: inset 0em 0em 4em rgba(0,0,0,0.5);
				border-radius: 2em;
				padding: 2em 8em;
				
				// look draggable
				cursor: ew-resize;

				// text settings
				span { 
					font-size: 16em;
					filter: drop-shadow(0em 0em 0.1em rgba(255,0,0,0.7));
				}
				font-weight: bold;
				color: rgb(235, 29, 29);
				font-family: monospace;				
				text-align: center;
				text-shadow: 1em 1em 1em rgba(0,0,0,0.7);
				
			}// .value
			
			// when a wire is plugged in, disable the field
			&.disabled {
				.btn, .value {
					opacity: 0.4;
					pointer-events: none;
					cursor: default;
				}
				.value span { opacity: 0; }
			}// &.disabled

		}// .number-box

		// leds
		.led {

			// fixed pos
			position: absolute;
			top: 213em;

			// round circle base
			width: 14em;
			height: 14em;
			border: 2em solid black;
			border-radius: 50%;
			background: #222;
			box-shadow: inset 0em 0em 6em rgba(0,0,0,0.7);

			// the bulb itself
			.led-inner {
				width: 9em;
				height: 9em;
				border-radius: 50%;
				background: rgb(97, 2, 2);
				margin: 0.5em;
				box-shadow: inset 0em 0em 4em rgba(0,0,0,0.7);
				transition: background 0.3s;
			}// .led-inner

			// light up when on
			&.on {
				.led-inner {
					background: rgb(255, 0, 0);
					box-shadow: 0em 0em 20em rgba(255,0,0,0.8), inset 0em 0em 4em rgba(0,0,0,0.7);
					filter: drop-shadow(0em 0em 4em rgba(255,0,0,1));
				}
			}

			&.degrees {				
				left: 100em;
			}

			&.radians {
				left: 210em;
			}
		}// led

		// the toggle switch for degrees/radians
		.angle-toggle {

			// for debug
			/* border: 1px solid red; */
			/* background: rgba(255, 0, 0, 0.5); */

			// fixed pos
			position: absolute;
			top: 203em;
			height: 34em;
			left: 118em;
			width: 87em;

			// look like a clickable button
			cursor: pointer;

			// the actual image that will switch
			.toggle-inner {

				// for debug
				/* border: 1px solid blue; */

				// fixed size & position
				position: absolute;
				inset: -10em 5em 5em 5em;

				// background image
				background: url('/SuperWave/switch.png');
				background-size: 100% 100%;
				background-repeat: no-repeat;

			}// .toggle-inner

			// mirror toggle when in radian mode
			.toggle-inner.radians {
				transform: scaleX(-1);
			}
		
		}// .angle-toggle

		// container where we'll mount our sine wave screen
		.screen {

			// for debug
			/* border: 1px solid greenyellow; */
			border: 1em solid rgb(66, 100, 11);

			position: absolute;
			inset: 48em 24em auto 21em;
			height: 78em;
			
		}// .screen

	}// .super-wave-node
	
</style>
