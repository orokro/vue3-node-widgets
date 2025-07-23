<!--
	NumberInput.vue
	---------------

	Reusable number input for types that require one or more number inputs.
-->
<template>

	<input 
		v-model="localValue" 
		@blur="updateModel" 
		type="text" 
		class="input-box"
	/>

</template>
<script setup>

// vue imports
import { ref, watch, defineProps, defineEmits } from 'vue'

// props for the input
const props = defineProps({

	// model value for the input
	modelValue: {
		type: String,
		default: ''
	}
})
// so we can update the model value
const emit = defineEmits(['update:modelValue'])

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
	localValue.value = newVal
})

function updateModel() {
	emit('update:modelValue', localValue.value)
}

</script>
<style lang="scss" scoped>

	.input-box {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
		width: 100%;
		box-sizing: border-box;
	}

</style>
