<!--
	AddButton.vue
	-------------

	A simple button component to show an "add node" menu when clicked.
-->
<template>

	<div
		class="add-button"
		title="Add Node"
		@click="handleClick" 
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
			<path d="M19,13H13v6h-2v-6H5v-2h6V5h2v6h6V13z"/>
		</svg>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, inject, computed } from 'vue';

// events
const emits = defineEmits(['showAddMenu']);

/**
 * Handle click on the button, emit event to show add menu
 * 
 * @param {MouseEvent} event - the mouse event
 */
function handleClick(event) {

	event.fromAddButton = true;
	emits('showAddMenu', event);	

}

</script>
<style lang="scss" scoped>

	// main button styles
	.add-button {

		// fixed on bottom-left
		position: absolute;
		bottom: 20px;
		left: 20px;

		// fixed size circle
		width: 50px;
		height: 50px;
		border-radius: 50px;

		// background and shadow
		background: var(--nw-node-input-accent1);
		box-shadow: 0 2px 5px rgba(0,0,0,0.3);
		
		backdrop-filter: blur(5px);
		opacity: 0.5;
		
		&:hover {
			cursor: pointer;
			background: var(--nw-node-input-accent2);
		}

		// center the svg icon
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;

		svg {
			transform: scale(2);
		}

	}// .add-button

</style>
