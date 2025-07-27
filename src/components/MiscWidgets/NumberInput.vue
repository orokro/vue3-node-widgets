<!--
	NumberInput.vue
	---------------

	Reusable number input for types that require one or more number inputs.
-->
<template>

	<!-- by default we'll show a div with the value that has dragging-enabled, but 
		we can also show an input box if we want to edit the value directly -->
	<div
		:class="{
			'number-input-wrapper': true,
			'invalid-value': invalidValue,
			'read-only': readOnly,
			'input-enabled': inputEnabled,
			...roundCss
		}"
		:style="{
			'border-width': props.border,
			'border-style': 'solid',
			'border-color': 'black',
		}"
	>	
		<!-- just show the value if we don't have input enabled -->
		<div 
			class="number-value"			
			@mousedown="startDrag"
			@click="showInput"
		>

			<template v-if="min !== null && max !== null">
				<!-- background bar for the slider -->
				<div 
					class="slider-bg-bar" 
					:style="{
						width: `${((localValue - min) / (max - min)) * 100}%`
					}"
				/>
			</template>

			<span class="value-text">{{ formatLocalValue(localValue) }}</span>

			<div
				v-if="showButtons && !isDragging"
				class="btn decrement"
				:title="`Decrease by ${step}`"
				@mousedown.stop
				@mouseup.stop.prevent="changeValue(localValue - step)"
			>
				<span>◀</span>
			</div>
			<div
				v-if="showButtons && !isDragging"
				class="btn increment"
				:title="`Increase by ${step}`"
				@mousedown.stop
				@mouseup.stop.prevent="changeValue(localValue + step)"
			>
				<span>▶</span>
			</div>
		</div>

		<input 
			v-if="inputEnabled" 
			ref="inputRef"
			:disabled="readOnly"
			v-model="localValue"
			type="text"
			class="input-box"
			@blur="cleanOnEnd" 
			@keydown.enter="cleanOnEnd"
		/>

	</div>

</template>
<script setup>

// vue imports
import { ref, watch, defineProps, defineEmits, inject, nextTick, computed } from 'vue'

// props for the input
const props = defineProps({

	// model value for the input
	modelValue: {
		default: 1000
	},

	// true if we're in read-only mode
	readOnly: {
		type: Boolean,
		default: false
	},

	// the validate function for the input. returns true or false
	validate: {
		type: Function,
		default: (value) => true,
	},
	
	// the lint function - returns a valid version of the value
	lint: {
		type: Function,
		default: (value) => value,
	},

	// step size for the buttons
	step: {
		type: Number,
		default: 1, // default step size
	},

	// speed multiplier for dragging
	dragSpeed: {
		type: Number,
		default: 1/50, // default drag speed
	},

	// the rounding style for the input
	round: {
		type: String,
		default: 'both', // 'left', 'right', 'both', or 'neither'
	},

	// true if we should show the increment buttons
	showButtons: {
		type: Boolean,
		default: true, // show buttons by default
	},

	// border property
	border: {
		type: String,
		default: '0px', // default border
	},

	// ignored if max isn't also set, used to render the slider bg bar
	min: {
		type: Number,
		default: null, // no minimum by default
	},

	// ignored if min isn't also set, used to render the slider bg bar
	max: {
		type: Number,
		default: null, // no maximum by default
	},

	// add some formatting to the value when displayed
	formatFn: {
		type: Function,
		default: (value) => value, // default format function
	},

});


// so we can update the model value
const emit = defineEmits(['update:modelValue'])

// reference to our input element so we can focus it when clicked
const inputRef = ref(null);

// save copy of our local value
const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
	localValue.value = newVal
})

// true when we're in an error state
const invalidValue = ref(false);

// true when we have the input enabled
const inputEnabled = ref(false);

// save the last known-good value
let lastValidValue = props.modelValue;

// get our reusable drag helper
const dh = inject('dh');

// when a drag starts, we want to potentially cancel the mouse-up event
// so we don't enable the input
const dragDidStart = ref(false);

// true whilst we're dragging the input
const isDragging = ref(false);

// helper to see which side should have rounding CSS
const roundCss = computed(()=>{

	let classNames = {
		'rounded-left': (props.round === 'left' || props.round === 'both'),
		'rounded-right': (props.round === 'right' || props.round === 'both'),
	};
	return classNames;
});

/**
 * Makes sure we never show more than 2 decimal places, but isn't always fixed, 
 * and omits decimal places for whole numbers.
 * 
 * @param val - The value to format
 */
function formatLocalValue(val) {
	if (val === '') return '_';

	const num = Number(val);
	if (Number.isNaN(num)) return val;

	const lv = Number.isInteger(num) ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');

	return props.formatFn(lv);
}

watch(()=>localValue.value, (newVal) => {

	// check if the value is valid
	invalidValue.value = !isValidValue(newVal);
});


/**
 * Built in lint function that checks if the value is valid
 * 
 * This will use both the props.lint and props.validate functions
 * But it will also check if the value is a valid number, since
 * we're dealing with numbers here.
 * 
 * @param value - The value to lint
 */
function lint(value){

	// use built in lint function if not provided
	value = props.lint(value);

	// if its still invalid, set it to the last known-good value
	const validNumber = isValidNumber(value);
	const valid = props.validate(value) && validNumber;
	
	if (!valid) {
		value = lastValidValue;
	}

	// make sure the value is not a string ffs
	if (typeof value === 'string') {
		value = parseFloat(value);
	}

	return value;
}


/**
 * Checks if the value is valid using the provided validate function
 * 
 * @param value - The value to check
 * @returns {boolean} - True if the value is valid, false otherwise
 */
function isValidValue(value) {

	const isValid = props.validate(value);
	const isValidNum = isValidNumber(value);

	return isValid && isValidNum;
}


/**
 * Function to check if a value (string or raw number) is a valid number
 * @param {string|number} value - The value to check
 * @returns {boolean} - True if the value is a valid number, false otherwise
 */
function isValidNumber(value) {

	if (typeof value === 'number') {
		return Number.isFinite(value)
	}

	if (typeof value === 'string') {
		// Trim whitespace and test for a strict numeric pattern
		const trimmed = value.trim()

		// This regex matches valid integers and floats (with optional leading + or -)
		const numberRegex = /^[+-]?(\d+(\.\d+)?|\.\d+)$/

		return numberRegex.test(trimmed)
	}

	return false
}


/**
 * Enables the input box for editing the value
 */
function changeValue(newVal) {

	// check if it's a valid new value
	const isValid = isValidValue(newVal);

	// clean it up regardless
	newVal = props.lint(newVal);

	// regardless of validity, update the local value
	localValue.value = newVal;

	// if it's valid, update the model value
	if (isValid){
		updateModel(newVal);
	}

	cleanOnEnd();
}


/**
 * When the user ends an interaction (either click-n-drag, keyboard, or typing the the field),
 * we want to clean up the input and update the model value.
 */
function cleanOnEnd(){

	// regardless of which mode we're in, we want to disable the input
	inputEnabled.value = false;

	// check if it's valid
	const isValid = isValidValue(localValue.value);

	// get value
	let value = isValid ? localValue.value : lint(localValue.value);

	// don't let value be a string
	if (typeof value === 'string') {
		value = parseFloat(value);
	}

	// update the model
	localValue.value = value;
	updateModel(localValue.value);
}


/**
 * Updates the model value and sets the last valid value	
 * 
 * @param newVal - The new value to set
 */
function updateModel(newVal) {
	emit('update:modelValue', newVal);
	lastValidValue = newVal;
	invalidValue.value = false;
}


/**
 * Starts the drag-routine for updating the value
 */
function startDrag(){

	// if we're read-only, gtfo
	if (props.readOnly) return;

	// only if we meet the threshold
	dragDidStart.value = false;
	isDragging.value = true;

	// set the local value to the model value
	const initialValue = props.modelValue;

	dh.dragStart(
		(dx, dy) => {

			// update the local value based on the drag distance
			let newValue = initialValue - dx * props.dragSpeed;
			newValue = parseFloat(newValue.toFixed(2));
			changeValue(newValue);

			// use pythagorean theorem to see if we moved enough to consider it a drag
			const dragThreshold = 5;
			if (!dragDidStart.value && (dx * dx + dy * dy) > dragThreshold * dragThreshold) {
				dragDidStart.value = true;
			}

		},
		(dx, dy) => {

			cleanOnEnd();
			isDragging.value = false;			
		},
	);
}


/**
 * When clicked on we wanna show the input box, unless a drag happened in between
 */
function showInput(){
	
	// if we're read-only, gtfo
	if (props.readOnly){
		inputEnabled.value = false;
		return;
	}

	// gtfo if we started a drag
	if (dragDidStart.value){
		dragDidStart.value = false;
		return;
	}

	// enable the input & wait a tick to focus it
	inputEnabled.value = true;
	nextTick(() => {

		// focus & select all the text in the input
		inputRef.value.focus();
		inputRef.value.select();
	});
}

</script>
<style lang="scss" scoped>

	// main outer-wrapper for the number input
	.number-input-wrapper {
		
		// so we can position children abso-lutely
		position: relative;

		// border rounding	
		&.rounded-left, &.rounded-left input {
			border-radius: 20em 0em 0em 20em;
		}
		&.rounded-right, &.rounded-right input {
			border-radius: 0em 20em 20em 0em;
		}
		&.rounded-left.rounded-right, &.rounded-left.rounded-right input {
			border-radius: 20em;
		}

		// allow nothing to escape
		/* border: 2px solid black; */
		overflow: clip;

		// when the input value is invalid
		&.invalid-value {
			background: salmon;

			.number-value {
				background: salmon;
			}
			input {
				background: salmon;
			}

		}// &.invalid-value

		&.input-enabled {
			.number-value {
				/* opacity: 0; */
			}
		}// &.input-enabled

		// padding: 0.5rem;
		// border: 1px solid #ccc;
		border-radius: 0em;
		width: 100%;
		box-sizing: border-box;

		// the text value (if not input enabled)
		.number-value {

			background: gray;
			text-align: center;
			color: white;
			padding: 2em;

			cursor: ew-resize;

			.value-text {
				position: relative;
				font-size: 12em;
			}
		}// .number-value

		// the actual text input
		input {

			// fill the container
			position: absolute;
			inset: 0em 0em 0em 0em;
			text-align: center;
			font-size: 12em;
			border: 0px none;
			outline: none
		};

		// the bar that fills the bg when it has a min/max
		.slider-bg-bar {
			position: absolute;
			inset: 0px auto 0px 0px;
			background: rgba(0, 0, 0, 0.3);
		}

		// the increment/decrement buttons
		.btn {	

			position: absolute;
			top: 0em;
			bottom: 0px;
			width: 15em;

			/* border: 1px solid red; */
			&.decrement {
				left: 0em;
			}

			&.increment {
				right: 0em;
			}

			// appear clickable to user
			cursor: pointer;

			// slightly transparent by default until hovered
			opacity: 0.0;
			&:hover {
				opacity: 1;
			}

			span {
				position: absolute;
				top: 44%;
				left: 50%;
				transform: translate(-50%, -50%);
				font-size: 12em;
			}

		}// .btn

		&:hover .btn {
			// show the buttons on hover
			opacity: 0.5;
		}

		// override styles for read-only mode
		&.read-only {
			opacity: .5;
			
			.number-value {
				font-style: italic;
				cursor: not-allowed !important;
			}
			
			.btn {
				pointer-events: none;
			}
		}// &.read-only

	}// .number-input-wrapper

</style>
