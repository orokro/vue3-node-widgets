<!--
	NodeFieldColumn.vue
	-------------------

	Originally the Node.vue component rendered all it's fields in a single column.

	However, when I decided to add two-column support (primarily for group nodes), I realized
	it would make sense to break out the column rendering as it's own component so we can render
	a (left) column of input fields & a (right) column of output fields.

	This component was born by taking the field rendering code out of Node.vue and putting it here,
	but we still wanna call some of the functions & state logic on our parent, so those are passed
	in as props.
-->
<template>

	<!-- main outer-wrapper -->
	<div class="node-field-column">

		<!-- this will spawn the rows of built-in components -->
		<div 
			class="node-field-row"
			v-for="(field, index) in fieldsList"
			:key="field.id"			
			:data-type="field.fieldType"
		>
			<!-- all node kinds can have labels -->
			<NLabel 
				v-if="field.fieldType == FIELD_TYPE.LABEL"
				:key="field.id"
				:text="field.text"
				:align="field.align"/>

			<!-- if it wasn't a label then we're build a row for either an INPUT/OUTPUT/PROP -->
			<template v-else>

				<!-- if it's a processing node, or its prop on an input/output we show a field-name row -->
				<div 
					v-if="
						(
							node.constructor.nodeType == NODE_TYPE.PROCESSING
							||
							field.fieldType == FIELD_TYPE.PROP
						)
						&&
						!(
							field.fieldType == FIELD_TYPE.INPUT
							&&
							fieldHasInput(field)										
						)
						&&
						field.valueType != VGraph
					"
					class="field-name"
					:title="field.description"
				>
					<span>{{ field.title }}</span>
				</div>	

				<!-- area to spawn sockets below -->
				<div :ref="el => setSocketRef(field.id, el)" class="socket-ref-el"/>

				<!-- otherwise, if we're processing node we'll mount it's component-->
				<component
					v-if="showWidgetFor(field)"
					:is="getFieldComponent(field)"
					:key="field.id"								
					:node="node"
					:field="field"
					:read-only="field.fieldType == FIELD_TYPE.OUTPUT"
				/>

				<!-- otherwise, if it's an input node and an input field, or an output node and an output field
					then we just show the field name aligned to the socket -->
				<NFieldNameWidget
					v-else
					:text="field.title"
					:align="field.fieldType == FIELD_TYPE.INPUT ? 'left' : 'right'"
				/>

			</template>

		</div>

	</div>
</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch, inject } from 'vue';

// components
import NLabel from './TypeWidgets/NLabel.vue';
import NFieldNameWidget from './TypeWidgets/NFieldNameWidget.vue';

// our app stuffs
import { FIELD_TYPE } from '@/classes/NWNode';
import { NODE_TYPE } from '@/classes/NWNode';
import { VGraph } from '@/classes/Types';

// make some props
const props = defineProps({

	// the node we're rendering fields for
	node: {
		type: Object,
		required: true
	},

	// the list of fields to render in this column
	fieldsList: {
		type: Array,
		required: true
	},

	// function to get the component for a field
	getFieldComponent: {
		type: Function,
		required: true
	},

	// function to determine if we should show a widget for a field
	showWidgetFor: {
		type: Function,
		required: true
	},

	// function to determine if a field has an input connected
	fieldHasInput: {
		type: Function,
		required: true
	},

	// function to set the socket ref for a field
	setSocketRef: {
		type: Function,
		required: true
	},

});

</script>
<style lang="scss" scoped>

	.node-field-column {

		/* background: red; */
		// the rows where we spawn the individual fields
		.node-field-row {

			padding: 6em 8em 0em 8em;
			
			color: var(--nw-node-field-text-color);

			&:last-child {
				padding-bottom: 6em;
			}

			.field-name {

				padding: 6em 6em 0em;

				span {
					padding: 0em;
					font-size: 11em;
					font-style: italic;
					opacity: 0.85;
				}

			}// .field-name

		}// .node-field-row
	
	}// .node-field-column

</style>
