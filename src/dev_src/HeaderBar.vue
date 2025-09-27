<!--
	HeaderBar.vue
	-------------

	For now, this wil allow the user to add multiple graphs, and switch between them.
-->
<template>

	<div class="header-bar">

		<!-- label -->
		<div class="lbl">Graphs:</div>

		<!-- loop to list graphs -->
		<div 
			class="graph-item" 
			v-for="(g, gIdx) in app.graphs.value" 
			:key="gIdx"
			:class="{ active: app.currentGraph.value != null && g === app.currentGraph.value }"
			@click="app.selectGraph(g)"
		>
			G_#{{ gIdx }}
		</div>

		<!-- add graph btn -->
		<div 
			class="graph-item add-graph-btn" 
			@click="app.addGraph()"
			title="Add New Graph"
		>
			<i class="material-icons">add</i>
		</div>
	</div>
</template>
<script setup>

// vue
import { ref, onMounted, inject } from 'vue';

// our app
import NWEditorGraph from '@Components/NWEditorGraph.vue';

// get our app data
const app = inject('app');

</script>
<style lang="scss" scoped>

	// the main outer-wrapper
	.header-bar {

		// for debug
		/* border: 1px solid rgba(255, 0, 0, 0.315); */

		// fill parent container
		position: absolute;
		inset: 0px;

		// layout flex stuffs
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;

		// the label
		.lbl {

			// text settings
			color: #CCC;
			font-weight: bold;
			user-select: none;
		}// .lbl

		// one of the graph buttons
		.graph-item {

			// text settings
			color: #EEE;
			font-size: 0.9em;
			user-select: none;

			// padding and border
			padding: 4px 8px;
			border: 1px solid rgba(255, 255, 255, 0.2);
			border-radius: 4px;

			// cursor
			cursor: pointer;

			// hover state
			&:hover {
				background: rgba(255, 255, 255, 0.1);
			}

			// active state
			&.active {
				background: rgba(100, 100, 255, 0.2);
				border-color: rgba(100, 100, 255, 0.5);
				font-weight: bold;
			}

			// add graph btn
			&.add-graph-btn {

				// make it a square
				width: 28px;
				height: 28px;
				padding: 0px;

				// center the icon
				display: flex;
				align-items: center;
				justify-content: center;

				// icon settings
				i {
					font-size: 1.5em;
					color: #AAA;
					pointer-events: none;
				}// i

				// hover state
				&:hover {
					background: rgba(255, 255, 255, 0.2);
					i {
						color: #FFF;
					}
				}

			}// .add-graph-btn

		}// .graph-item

	}// .header-bar

</style>
