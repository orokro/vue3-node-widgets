<!--
	NVVector3Widget.vue
	-------------------

	This will be the component used to display the NVVector3 type in the node UI.
-->
<template>

	<div class="n-vector3-widget" :style="{
		'text-align': align,
	}">

		<!-- the outer most wrapper -->
		<div class="input-wrapper">

			<!-- by default show value & click to enable the input -->
			<div class="number-value-row">

				<div class="icon"></div>

				<div class="vector-wrapper">

					<div class="x">
						<NumberInput 
							v-model="xValue"
							@update:modelValue="xValue = $event"
							:lint="lintFloat"
							:validate="validateFloat"
							:step="1"
							round="left"
						/>
					</div>

					<div class="y">
						<NumberInput 
							v-model="yValue"
							@update:modelValue="yValue = $event"
							:lint="lintFloat"
							:validate="validateFloat"
							:step="1"
							border="0px 0px 0px 2px"
							round="neither"
						/>
					</div>

					<div class="z">
						<NumberInput 
							v-model="zValue"
							@update:modelValue="zValue = $event"
							:lint="lintFloat"
							:validate="validateFloat"
							:step="1"
							border="0px 0px 0px 2px"
							round="right"
						/>
					</div>

				</div>
			</div>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch } from 'vue';

// components
import NumberInput from './NumberInput.vue';

// types + misc
import { VNumber } from '@/classes/Types';

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
const xValue = shallowRef(props.node.fieldState[props.field.name].val.x);
const yValue = shallowRef(props.node.fieldState[props.field.name].val.y);
const zValue = shallowRef(props.node.fieldState[props.field.name].val.z);

watch([xValue, yValue, zValue], ([newX, newY, newZ], [oldX, oldY, oldZ]) => {

	// update the node's field state when the value changes
	props.node.fieldState[props.field.name].val = {
		x: newX,
		y: newY
	};
	
});


const lintFloat = (value)=>{

	value = VNumber.lint(value);
	return value;
};


const validateFloat = (value)=>{
	return VNumber.validate(value);
}

</script>
<style lang="scss" scoped>

	.n-vector3-widget {
		
		.input-wrapper {
			
			.number-value-row {

				// so we can position children abso-lutely
				position: relative;

				// for debug
				// border: 1px solid blue;
				padding: 0em 0em 3em 24em;
				cursor: pointer;

				// text alignment
				text-align: var(--align, left);

				// icon on left
				.icon {
					position: absolute;
					inset: 2em 2em auto 2em;
					width: 18em;
					height: 18em;

					// for debug
					/* border: 1px solid red; */

					// bg image for icon
					background: url('/img/icons/vector_3.png') no-repeat center center;
					background-size: 100% 100%;
				}// icon

				// box around the three inputs
				.vector-wrapper {
					width: 100%;
					height: 22em;

					display: flex;
					.x {
						width: 33.33%;
					}
					.y {
						width: 33.33%;
					}
					.z {
						width: 33.33%;
					}
				}// .vector-wrapper

			}// .number-value-row

		}// .input-wrapper

	}// .n-vector2-widget

</style>
