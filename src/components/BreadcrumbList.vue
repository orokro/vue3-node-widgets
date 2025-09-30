<!--
	BreadcrumbList.vue
	------------------

	When the NWEditorGraph is opened to edit a sub-graph,
	this component shows the breadcrumb trail of parent graphs.
-->
<template>

	<!-- main outer row, used to clip breadcrumbs in and out of existence -->
	<div
		class="breadcrumb-clip-container"
		:class="{ 'disabled': !enabled }"
	>
		<div class="breadcrumb-row">

			<!-- list of bread crumbs -->
			<div 
				class="breadcrumb-box"
				v-for="graph, idx in crumbs"
				:key="graph.id"
				@click="e=>clickCrumb(idx, e)"
			>
				<span>{{ graph.name }}<span class="arrow"> ➤</span></span>
				<div 
					class="close-button"
					@click="e=>clickCrumb(idx-1, e)"
				>
					<span>✖</span>
				</div>
			</div>
		</div>
	</div>

</template>
<script setup>

// vue
import { ref, computed, onMounted, shallowRef, watch, inject } from 'vue';

// props
const props = defineProps({

	// the editor instance
	editor: {
		type: Object,
		required: true
	},
});


// list of bread crumbs, including the current graph
const crumbs = computed( () => {

	return [
		...props.editor.parentGraphs.value,
		{
			id: 'current',
			name: props.editor.graphName.value,
			graph: props.editor.rootGraphRef.value,
		}
	];
});


// only enabled if there's more than one graph in the list
const enabled = computed( () => {
	return props.editor.parentGraphs.value.length > 0;
});


/**
 * Handle when a bread crumb is clicked
 * 
 * @param {Number} idx - index of the crumb that was clicked
 * @param {Event} e - the click event
 */
function clickCrumb(idx, e){

	// if they clicked the close button, remove that graph from the trail
	props.editor.selectBreadcrumb(idx);
}	

</script>
<style lang="scss" scoped>

	// most outer box that clips the breadcrumbs
	.breadcrumb-clip-container {
	
		// positioning
		position: absolute;
		inset: 0px 0px auto 0px;

		// fixed height, regardless of zoom
		height: 40px;
		overflow: clip;

		// animate height and opacity
		transition: height 0.3s ease, opacity 0.3s ease;
		opacity: 1.0;
		&.disabled {
			pointer-events: none;
			height: 0px;
			opacity: 0.0;
		}

		// make sure the row below is aligned on the bottom
		display: flex;
		flex-direction: column;
		justify-content: flex-end;

		// nice dark bg
		background: rgba(20,20,20,0.6);
		backdrop-filter: blur(3px);

		// fixed row on top
		.breadcrumb-row {

			// flex row stacking right
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
			align-items: center;

			// spacing
			padding: 6px 8px;

			// allow horizontal scrolling if too many crumbs
			overflow-x: auto;

			// the buttons
			.breadcrumb-box {

				// position relative so the close button can be absolute inside
				position: relative;

				// box settings & spacing
				border-radius: 4px;
				padding: 4px 8px;
				margin-right: 6px;
				background: rgba(255, 255, 255, 0.3);

				// look clickable & light up on hover
				cursor: pointer;
				transition: background-color 0.3s ease;
				&:hover {
					background: rgba(255, 255, 255, 0.5);
				}

				// text settings
				color: white;
				font-size: 14px;
				white-space: nowrap;

				// only show delete button when the last button is overed
				.close-button {
					
					// fixed on top right of the crumb
					position: absolute;
					top: 4px;
					right: 4px;					
					margin-left: 8px;
					cursor: pointer;

					// hidden till hover
					display: none;

					// red circle bg
					background: rgba(255, 0, 0, 0.6);
					width: 20px;
					height: 20px;
					border-radius: 50%;

					// look clickable & light up on hover
					transition: background-color 0.3s ease;
					&:hover {
						background: rgba(255, 0, 0, 0.9);
					}

					// force text to center
					text-align: center;

				}// .close-button

				// just the arrow
				&:last-child {
					
					// hide arrow but don't break line flow
					:not(first-child){
						.arrow {
							overflow: clip;
							opacity: 0;
							width: 0px;
							display: inline-block;
						}// .arrow
					}

					&:hover {
						padding-right: 30px;

						.close-button {
							// show the close button
							display: block;
						}
					}

				}// &:last-child

				// never allow close button on first crumb
				&:first-child {
					
					padding-right: 8px !important;

					.close-button {
						display: none !important;
					}

					&:hover {
						padding-right: 8px !important;

						.close-button {
							display: none !important;
						}
					}
				}// &:first-child

			}// .breadcrumb-box

		}// .breadcrumb-row
	
	}// .breadcrumb-clip-container

</style>
