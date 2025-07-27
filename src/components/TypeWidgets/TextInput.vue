<!--
	TextWidget.vue
	--------------

	Reusable number input for types that require one text string, names, chars, etc.
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
			class="text-value"			
			@mouseup="showInput"
		>
			<span class="value-text">{{ formatLocalValue(localValue) }}</span>
		</div>

		<input 
			v-if="inputEnabled" 
			ref="inputRef"
			:disabled="readOnly"
			v-model="localValue"
			type="text"
			class="input-box"
			:minlength="singleCharMode ? 1 : minLength"
			:maxlength="singleCharMode ? 1 : maxLength"
			@blur="cleanOnEnd" 
			@keydown="handleKeydown"
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
		default: ''
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

	// the rounding style for the input
	round: {
		type: String,
		default: 'both', // 'left', 'right', 'both', or 'neither'
	},

	// border property
	border: {
		type: String,
		default: '0px', // default border
	},

	// text min length
	minLength: {
		type: Number,
		default: null, // no minimum by default
	},

	// text maximum length
	maxLength: {
		type: Number,
		default: null, // no maximum by default
	},

	// single character mode
	singleCharMode: {
		type: Boolean,
		default: false,
	},

	// add some formatting to the value when displayed
	formatFn: {
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
});

// last valid value, used to reset the input when invalid
let lastValidValue = props.modelValue;

// true when we're in an error state
const invalidValue = ref(false);

// true when we have the input enabled
const inputEnabled = ref(false);

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

	val = val || ' ';
	return props.formatFn(val);
}


/**
 * Prepare box for input when a key is pressed
 * 
 * @param e - The keydown event
 */
function handleKeydown(e) {

	// If we're in singleCharMode and a printable key is pressed
	if (props.singleCharMode && e.key.length === 1) {
		localValue.value = ''; // clear it so new char replaces old one
	}
}


watch(()=>localValue.value, (newVal) => {

	// check if the value is valid
	invalidValue.value = !isValidValue(newVal);
});


function lint(value){

	// use built in lint function if not provided
	value = props.lint(value);

	// if its still invalid, set it to the last known-good value
	const valid = props.validate(value);
	
	if (!valid) {
		value = lastValidValue;
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
	return isValid;
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
 * When clicked on we wanna show the input box, unless a drag happened in between
 */
function showInput(){
	
	// if we're read-only, gtfo
	if (props.readOnly){
		inputEnabled.value = false;
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

			.text-value {
				background: salmon;
			}
			input {
				background: salmon;
			}

		}// &.invalid-value

		&.input-enabled {
			.text-value {
				/* opacity: 0; */
			}
		}// &.input-enabled

		// padding: 0.5rem;
		// border: 1px solid #ccc;
		border-radius: 0em;
		width: 100%;
		box-sizing: border-box;

		// the text value (if not input enabled)
		.text-value {

			background: gray;
			text-align: center;
			color: white;
			padding: 2em;

			cursor: text;

			.value-text {
				position: relative;
				font-size: 12em;
			}
		}// .text-value

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

		// override styles for read-only mode
		&.read-only {
			opacity: .5;
			
			.text-value {
				font-style: italic;
				cursor: not-allowed !important;
			}
			
		}// &.read-only

	}// .number-input-wrapper

</style>
