<!--
	NVNumberWidget.vue
	------------------

	This will be the component used to display the NVNumber type in the node UI.

	This will appear editing for input & props & readonly for outputs / wired inputs.
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
					:lint="lint"
					:validate="validate"
					:step="10"
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
const numberValue = shallowRef(props.node.fieldState[props.field.name].val);

watch(()=>numberValue.value, (newVal) => {

	// update the node's field state when the value changes
	props.node.fieldState[props.field.name].val = newVal;
	
});


const lint = (value)=>{

	const valueType = props.field.valueType;
	// both the type itself has a lint fn,
	// as well as field itself.
	// run both:
	value = valueType.lint(value);
	value = props.field.lintFn(value);

	// if the value type has a min/max apply them
	if(valueType.min!==undefined && valueType.min!==null)
		value = Math.max(value, valueType.min);
	if(valueType.max!==undefined && valueType.max!==null)
		value = Math.min(value, valueType.max);

	return value;
};


const validate = (value)=>{

	// both the type itself has a validate fn,
	// as well as field itself.
	// run both:
	return props.field.valueType.validate(value) && props.field.validateFn(value);
}

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
