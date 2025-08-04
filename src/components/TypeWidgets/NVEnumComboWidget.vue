<!--
	NVEnumComboWidget.vue
	---------------------

	This will be the component used to display the NEnum type in the node UI.
	It will be a combo box, with the enum values as options.
-->
<template>

	<div 
		class="n-enum-widget" 
		:style="{
			'text-align': align,
		}"
	>
		<!-- the outer most wrapper -->
		<div class="input-wrapper">

			<div class="enum-value-row">

				<!-- gray wrapper for the select box -->
				<div class="gray-wrapper">

					<select
						v-model="itemIndex"
						:class="{
							'input-enabled': !props.node.fieldState[props.field.name].readOnly,
							'read-only': readOnly
						}"
						:disabled="readOnly"
					>
						<option 
							v-for="(item, index) in items" 
							:key="index" 
							:value="index"
						>
							{{ item }}
						</option>
					</select>
				</div>
			</div>

		</div>
	</div>
</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch } from 'vue';

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

// the items for the select box
const items = props.field.valueType.items;

// we'll store the editable value here & run our state logic on it
const itemIndex = shallowRef(props.node.fieldState[props.field.name].val);

watch(()=>itemIndex.value, (newVal) => {

	// update the node's field state when the value changes
	props.node.fieldState[props.field.name].val = newVal;
});

watch(()=>props.node.fieldState[props.field.name].val, (newVal) => {

	// update the itemIndex when the node's field state changes
	itemIndex.value = newVal;
});

</script>
<style lang="scss" scoped>

	.n-enum-widget {
		
		.input-wrapper {
			
			overflow: clip;

			position: relative;
			.enum-value-row {

				padding: 0em 0em 3em 0em;
				
				.gray-wrapper {
					border-radius: 10em;
					background: gray;
					height: 18em;

					select {

						background: gray;
						border-radius: 10em;
						width: calc(100% - 0.4em);
						height: 100%;

						outline: none;
						border: 0px none;

						text-align: center;
						color: white;
						font-size: 12em;

						&.read-only {
							opacity: 0.5;
							cursor: not-allowed;
						}
					}// select

				}// .gray-wrapper

			}// .enum-value-row

		}// .input-wrapper

	}// .n-enum-widget

</style>
