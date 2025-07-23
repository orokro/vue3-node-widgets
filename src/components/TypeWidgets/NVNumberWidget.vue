<!--
	NVNumberWidget.vue
	------------------

	This will be the component used to display the NVNumber type in the node UI.
	This will also be reused in the VInteger type as well.

	This will appear editing for input & props & readonly for outputs.
-->
<template>

	<div class="n-number-widget" :style="{
		'text-align': align,
	}">

		<!-- the outer most wrapper -->
		<div class="input-wrapper">

			<!-- by default show value & click to enable the input -->
			<div class="number-value-row">
				<NumberInput 
					v-model="numberValue"
					@update:modelValue="numberValue = $event"
				/>
			</div>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch } from 'vue';

// components
import NumberInput from './NumberInput.vue';

// props
const props = defineProps({

	// the node this widget is for
	node: {
		type: Object,
		required: true
	},

	// the field this widget is for
	field: {
		type: Object,
		required: true
	},

	// the alignment of the label text
	align: {
		type: String,
		default: 'left'
	},
});

onMounted(() => {
	// console.log("NVNumberWidget mounted");
	// console.log("node", props.node);
	// console.log("field", props.field);
	// console.log("align", props.align);
});

// we'll store the editable value here & run our state logic on it
const numberValue = shallowRef(props.node.fieldState[props.field.name].value);

watch(()=>numberValue.value, (newVal) => {

	// update the node's field state when the value changes
	props.node.fieldState[props.field.name].value = newVal;
	
});


</script>
<style lang="scss" scoped>

	.input-wrapper {
		
		// for debug
		// border: 1px solid red;

		.number-value-row {

			// for debug
			// border: 1px solid blue;
			padding: 3em;
			cursor: pointer;

			// text alignment
			text-align: var(--align, left);
			// background: red;
		}// .number-value-row

	}// .input-wrapper


</style>
