<!--
	DevErrors.vue
	-------------

	This component will be spawned int he NWEditorGraph component,
	and will be used to display any errors that occur in the system.

	This component will be disabled by default and is controlled by
	the "show-dev-errors" prop on the NWEditorGraph component.

	When enabled, it will display a list of errors that have occurred to aid in debugging.
-->
<template>

	<!-- don't even show anything if no errors -->
	<template v-if="nwSystem.devErrors.errorsCount.value > 0">
		
		<div class="devErrorsBox">
			<div
				class="errorsList"
				:class="{collapsed:collapsed}"
			>
				<div
					v-for="err, n in nwSystem.devErrors.errorsList.value"
					:key="`${err.id}_${n}`"
					class="errorItem"
				>
					<div class="msg">{{ err.text }}</div>

					<!-- delete button for errors that are able to be deleted -->
					<div
						v-if="err.deletable"
						class="deleteError"
						@click="nwSystem.devErrors.removeErrorById(err.id)">
						❌
					</div>
				</div>
			</div>
			<div
				class="collapseBar"
				:title="collapsed ? 'Expand to see Errors' : 'Collapse to hide Errors'"
				@click="collapsed=!collapsed"
			>
				<span>{{ collapsed ? '▼ ▼ ▼' : '▲ ▲ ▲' }} ({{ nwSystem.devErrors.errorsCount.value }})</span>
			</div>
		</div>
	</template>
</template>
<script setup>

// vue
import { ref, watch } from 'vue';

// define some props
const props = defineProps({

	// reference to the NWEditor instance
	nwSystem: {
		type: Object,
		required: true
	},
});

// true when collapsed (default)
const collapsed = ref(true);

// we'll watch for changes to the errors list and auto-collapse if we run out of errors
watch(()=>props.nwSystem.devErrors.errorsCount.value, (newVal)=>{
	if(newVal==0){
		collapsed.value = true;
	}
});

</script>
<style lang="scss" scoped>

	// our main errors box
	.devErrorsBox {

		// position on the top-left, with fixed width for now
		position: absolute;
		top: 0px;
		left: 0px;

		// text styles
		font-family: 'Courier New', Courier, monospace;
		font-size: initial;
		font-weight: bolder;
		
		// transparent red bg, with some space on on the bottom for absolute positioning
		// the collapse bar
		background-color: rgba(255,0,0,0.35);
		width: 300px;
		padding-bottom: 25px;
		box-shadow: 2px 2px 5px 1px rgba(0,0,0,0.15);

		// allow nothing to escape
		overflow: hidden;

		// nice rounded corner on bottom-right
		border-bottom-right-radius: 8px;

		// the list of errors
		.errorsList {

			// no height when collapsed
			&.collapsed {
				height: 0px;
				overflow: hidden;
			}

			// one of our error item rows
			.errorItem {

				// for positioning children
				position: relative;

				// fixed row size
				min-height: 25px;
				width: 100%;
				box-sizing: border-box;
				// space on right for button
				padding-right: 15px;

				// division on top
				border-top: 1px solid rgb(192, 2, 2);

				// the actual message text
				.msg {
					padding: 5px;
					color: darkred;
				}

				// the delete button
				.deleteError {

					// fixed square on right side
					position: absolute;
					right: 0px;
					top: 0px;
					width: 25px;
					height: 25px;

					// appear clickable and become fully opaque on hover
					cursor: pointer;
					opacity: 0.5;
					&:hover {
						opacity: 1.0;
					}

				}// .deleteError

			}// .errorItem

		}// .errorsList

		// the bar to toggle the expand/collapse state
		.collapseBar {

			// fixed height, absolutely positioned on the bottom
			height: 25px;
			position: absolute;
			inset: auto 0px 0px 0px;

			// division on top
			border-top: 2px solid rgb(192, 2, 2);

			// text styles
			user-select: none;
			text-align: center;
			color: darkred;
			span {
				position: relative;
				top: 3px;
			}

			// look clickable to user & highlight on hover
			cursor: pointer;
			&:hover {
				background-color: rgba(255,255,255,0.1);
			}
		}// collapseBar

	}// .devErrorsBox

</style>
