<!--
	NVCharacterWidget.vue
	---------------------

	This will be the component used to display the NVText type in the node UI.
-->
<template>

	<div class="n-char-widget" :style="{
		'text-align': align,
	}">

		<!-- the outer most wrapper -->
		<div class="input-wrapper">

			<!-- by default show value & click to enable the input -->
			<div class="number-value-row">

				<div class="icon"></div>

				<TextInput 
					v-model="textValue"
					@update:modelValue="textValue = $event"
					:lint="lint"
					:validate="validate"
					:singleCharMode="true"
					:minLength="field.valueType.minLength"
					:maxLength="field.valueType.maxLength"
				/>
			</div>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch } from 'vue';

// components
import NumberInput from '../MiscWidgets/NumberInput.vue';
import TextInput from '../MiscWidgets/TextInput.vue';

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


// we'll store the editable value here & run our state logic on it
const textValue = shallowRef(props.node.fieldState[props.field.name].val);

watch(()=>textValue.value, (newVal) => {

	// update the node's field state when the value changes
	props.node.fieldState[props.field.name].val = newVal;
	
});


const lint = (value)=>{
	return value.charAt(0);
};


const validate = (value)=>{
	return value.length === 1;
}

</script>
<style lang="scss" scoped>

	.n-char-widget {
			
		.input-wrapper {
			
			// so we can position children abso-lutely
			position: relative;

			.number-value-row {

				padding: 0em 0em 3em 24em;
				cursor: pointer;

				// text alignment
				text-align: var(--align, left);

				// icon on left
				.icon {
					position: absolute;
					inset: 0em 2em auto 2em;
					width: 20em;
					height: 20em;

					// bg image for icon
					background: url('/img/icons/char.png') no-repeat center center;
					background-size: 100% 100%;
				}// icon

			}// .number-value-row

		}// .input-wrapper

	} // .n-char-widget

</style>
