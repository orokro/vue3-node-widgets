<!--
	Toggle.vue
	----------

	Reusable number toggle for booleans
-->
<template>

	<div
		:class="{
			'toggle-input-wrapper': true,
			'read-only': readOnly,
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
			class="toggle-track"			
			@click="toggleValue"
		>
			<span class="value-text">&nbsp;</span>
			<div 
				class="toggle-slider"
				:class="{ on: localValue }"
			/>
		</div>

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

});


// so we can update the model value
const emit = defineEmits(['update:modelValue'])

// save copy of our local value
const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
	localValue.value = newVal
});

// helper to see which side should have rounding CSS
const roundCss = computed(()=>{

	let classNames = {
		'rounded-left': (props.round === 'left' || props.round === 'both'),
		'rounded-right': (props.round === 'right' || props.round === 'both'),
	};
	return classNames;
});


/**
 * Enables the input box for editing the value
 */
function toggleValue() {

	// toggle
	localValue.value = !localValue.value;
	updateModel(localValue.value);
}


/**
 * Updates the model value and sets the last valid value	
 * 
 * @param newVal - The new value to set
 */
function updateModel(newVal) {
	emit('update:modelValue', newVal);
}

</script>
<style lang="scss" scoped>

	// main outer-wrapper for the number input
	.toggle-input-wrapper {
		
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

		// padding: 0.5rem;
		// border: 1px solid #ccc;
		border-radius: 0em;
		width: 100%;
		box-sizing: border-box;

		// the text value (if not input enabled)
		.toggle-track {

			background: gray;
			text-align: center;
			color: white;
			padding: 2em;

			cursor: pointer;

			.value-text {
				position: relative;
				font-size: 12em;
			}

			.toggle-slider {

				position: absolute;
				left: 2em;
				top: 2em;
				bottom: 2em;
				width: calc(50% - 2em);

				border-radius: 20em;

				background: #595959;

				transition: 
					left 0.2s ease-in-out,
					background-color 0.2s ease-in-out;

				&.on {
					left: 50%;
					background-color: white;
				}
			}// .toggle-slider

		}// .toggle-track


		// override styles for read-only mode
		&.read-only {
			opacity: .5 !important;
			pointer-events: none !important;
			
			.toggle-track {
				cursor: not-allowed !important;
			}
		}// &.read-only

	}// .toggle-input-wrapper

</style>
