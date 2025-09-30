<!--
	NVVector3Widget.vue
	-------------------

	This will be the component used to display the NVVector3 type in the node UI.
-->
<template>

	<div 
		class="n-angles-widget" 
		:style="{
			'text-align': align,
		}"
	>
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
							:formatFn="f => `θ ${f}°`"
							:read-only="readOnly"
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
							:formatFn="f => `ψ ${f}°`"
							:read-only="readOnly"
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
							:formatFn="f => `φ ${f}°`"
							:read-only="readOnly"
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
import NumberInput from '../MiscWidgets/NumberInput.vue';

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
	
	// true when read only
	readOnly: {
		type: Boolean,
		default: false
	},
});

const valueRef = props.node.fieldState[props.field.name].valueRef;

const xValue = computed({
	get() { return valueRef.value.x; },
	set(newVal) {
		valueRef.value = { ...valueRef.value, x: newVal,}
	}
});
const yValue = computed({
	get() { return valueRef.value.y; },
	set(newVal) {
		valueRef.value = {...valueRef.value, y: newVal}
	}
});
const zValue = computed({
	get() { return valueRef.value.z; },
	set(newVal) {
		valueRef.value = {...valueRef.value, z: newVal}
	}
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

	.n-angles-widget {
		
		.input-wrapper {
			
			.number-value-row {

				// so we can position children abso-lutely
				position: relative;

				// for debug
				// border: 1px solid blue;
				padding: 0em 0em 3em 24em;

				// text alignment
				text-align: var(--align, left);
				white-space: nowrap;
				// icon on left
				.icon {
					position: absolute;
					inset: 2em 2em auto 2em;
					width: 16em;
					height: 16em;

					// for debug
					/* border: 1px solid red; */

					// bg image for icon
					background: url('/img/icons/angle.png') no-repeat center center;
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

	}// .n-angles-widget

</style>
