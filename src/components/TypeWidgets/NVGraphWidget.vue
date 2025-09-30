<!--
	NVGraphWidget.vue
	-----------------

	Basically just shows the 'edit graph' button which opens the sub graph editor.
-->
<template>

	<div 
		class="n-graph-widget" 
		:style="{
			'text-align': align,
		}"
	>
		<!-- the outer most wrapper -->
		<div class="input-wrapper">

			<!-- by default show value & click to enable the input -->
			<div class="graph-value-row">
				<button type="button" @click="openGraph">
					<span>Edit Graph</span>
				</button>
			</div>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch, inject } from 'vue';

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

// we'll store the editable value here & run our state logic on it
const graph = props.node.fieldState[props.field.name].val;

// get the context for the graph editor
const ctxRef = inject('ctx');


/**
 * Open the sub graph editor for this graph
 */
function openGraph() {

	// get the graph name from the node's groupName field
	const graphName = props.node.fieldState['groupName'].val;

	// open the sub graph editor
	const ctx = ctxRef.value;
	ctx.openSubGraph(graphName, graph);
}

// debug mount test
onMounted(() => {
	// console.log("NVGraphWidget mounted", props.field.name, graph);
});

</script>
<style lang="scss" scoped>

	.n-graph-widget {
		
		.input-wrapper {
			
			.graph-value-row {

				// for debug
				// border: 1px solid blue;
				padding: 0em 0em 3em 0em;

				// text alignment
				text-align: var(--align, left);

				// make button fill width & look like a pretty clickable button
				button {

					// make button fill width
					width: 100%;
					padding: 0.5em 1em;

					// box styling
					border: bevel 0.2em #fff;
					border-radius: 0.5em;

					// appear clickable
					cursor: pointer;

					// text styling
					color: var(--button-color, white);

					// animated bg
					background-color: var(--button-bg, #616161);
					transition: background-color 0.3s ease;

					&:hover {
						background-color: var(--button-hover-bg, #919191);
					}

					&:disabled {
						background-color: var(--button-disabled-bg, #cccccc);
						cursor: not-allowed;
					}
					font-size: 12em;
					span { font-size: 1em; }
				}

			}// .number-value-row

		}// .input-wrapper

	}// .n-graph-widget

</style>
