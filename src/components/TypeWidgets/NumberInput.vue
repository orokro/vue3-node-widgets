<!--
	NumberInput.vue
	---------------

	Reusable number input for types that require one or more number inputs.
-->
<template>

	<!-- by default we'll show a div with the value that has dragging-enabled, but 
		we can also show an input box if we want to edit the value directly -->
	<div
		class="number-input-wrapper"
		:class="{
			'invalid-value': invalidValue,
		}"
	>

		<!-- just show the value if we don't have input enabled -->
		<div 
			class="number-value"
			@mousedown="startDrag"
			@mouseup="showInput"
		>
			<span>{{ localValue==='' ? '_' : localValue }}</span>

			<div
				class="btn decrement"
				@mouseup.stop.prevent="changeValue(localValue - 1)"
			>
				<span>◀</span>
			</div>
			<div
				class="btn increment"
				@mouseup.stop.prevent="changeValue(localValue + 1)"
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
import { ref, watch, defineProps, defineEmits, inject, nextTick } from 'vue'

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
// so we dont enable the input
let dragDidStart = false;


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
	if (isValid) 
		updateModel(newVal);
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

	// dont let value be a string
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
	dragDidStart = false;

	// set the local value to the model value
	const initialValue = props.modelValue;

	dh.dragStart(
		(dx, dy) => {

			// update the local value based on the drag distance
			let newValue = initialValue - dx/50;
			newValue = parseFloat(newValue.toFixed(2));
			changeValue(newValue);

			// use pythagorean theorem to see if we moved enough to consider it a drag
			const dragThreshold = 5;
			if (!dragDidStart && (dx * dx + dy * dy) > dragThreshold * dragThreshold) {
				dragDidStart = true;
			}

		},
		(dx, dy) => {

			cleanOnEnd();
		},
	);
}


/**
 * When clicked on we wanna show the input box, unless a drag happened inbetween
 */
function showInput(){
	
	// gtfo if we started a drag
	if (dragDidStart){
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
		
		position: relative;

		// when the input value is invalid
		&.invalid-value {
			background: salmon;

			.number-value {
				background: salmon;
			}
			input {
				background: salmon
			}

		}// &.invalid-value

		// padding: 0.5rem;
		// border: 1px solid #ccc;
		border-radius: 4em;
		width: 100%;
		box-sizing: border-box;

		// the text value (if not input enabled)
		.number-value {

			background: gray;
			text-align: center;
			color: white;
			padding: 5em;

			cursor: ew-resize;

			span {
				font-size: 16em;
			}
		}// .number-value

		input {
			// fill the container
			position: absolute;
			inset: 0px 0px 0px 0px;
			text-align: center
		};

		// the increment/decrement buttons
		.btn {

			position: absolute;
			top: 2px;
			
			&.decrement {
				left: 2px;
			}

			&.increment {
				right: 2px;
			}

			// appear clickable to user
			cursor: pointer;

			// slightly transparent by default until hovered
			opacity: 0.5;
			&:hover {
				opacity: 1;
			}

		}// .btn

	}// .number-input-wrapper

</style>
