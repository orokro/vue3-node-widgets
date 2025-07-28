<!--
	NVColor3Widget.vue
	-------------------

	This will be the component used to display the NVColor3 type in the node UI.
	(i.e. no alpha channel)
-->
<template>

	<div class="n-color3-widget" :style="{
		'text-align': align,
	}">

		<!-- the outer most wrapper -->
		<div class="input-wrapper">

			<!-- by default show value & click to enable the input -->
			<div class="number-value-row">

				<div class="icon"></div>

				<div class="flex-row">

					<div class="box off"><span>{{ field.valueType.offText }}</span></div>
					<div class="box switch">
						<Toggle 
							v-model="color"
							@update:modelValue="color = $event"
							:readOnly="props.node.readOnly"
							:field="field"
						/>
					</div>
					<div class="box on"><span>{{ field.valueType.onText }}</span></div>

				</div>
			</div>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch } from 'vue';

// components
import Toggle from '../MiscWidgets/Toggle.vue';

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


// const localValue = 
// we'll store the editable value here & run our state logic on it
const colorR = shallowRef(props.node.fieldState[props.field.name].val.r);
const colorG = shallowRef(props.node.fieldState[props.field.name].val.g);
const colorB = shallowRef(props.node.fieldState[props.field.name].val.b);

watch([colorR, colorG, colorB], ([nr, ng, nb], [or, og, ob]) => {

	// update the node's field state when the value changes
	props.node.fieldState[props.field.name].val = {
		r: nr,
		g: ng,
		b: nb
	};
	
});

</script>
<style lang="scss" scoped>

	.n-color3-widget {
		
		.input-wrapper {
			
			.number-value-row {

				// so we can position children abso-lutely
				position: relative;

				// for debug
				// border: 1px solid blue;
				padding: 0em 0em 3em 0em;
				cursor: pointer;

				// text alignment
				text-align: var(--align, left);

				// box around the three inputs
				.flex-row {
					width: 100%;
					height: 22em;

					display: flex;

					.box {
						width: 30%;
						
						&.on {
							padding: 3em 0em 3em 6em;
						}

						&.off {
							padding: 3em 6em 3em 0cqi;
							text-align: right;
						}

						&.switch {
							width: 40%;

							text-align: center;
							cursor: pointer;

							// the switch text
							span {
								font-size: 16em;
								font-weight: bold;
							}
						}

						span {
							font-size: 12em;
						}
					}// .box

				}// .flex-row

			}// .number-value-row

		}// .input-wrapper

	}// .n-color3-widget

</style>
