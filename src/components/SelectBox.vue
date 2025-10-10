<!--
	SelectBox.vue
	-------------

	Shows a box on screen when box-select dragging.
-->
<template>

	<div 
		class="select-box"
		:style="{
			left: selMgr.boxX.value + 'em',
			top: selMgr.boxY.value + 'em',
			width: selMgr.boxWidth.value + 'em',
			height: selMgr.boxHeight.value + 'em',
		}"
	/>

</template>
<script setup>

// vue
import { ref, computed, onMounted, onUnmounted } from 'vue';

// props
const props = defineProps({

	// the selection manager
	selMgr: {
		type: Object,
		required: true,
	},

});

</script>
<style lang="scss" scoped>

	.select-box {

		// absolute position in the node graph container, on top of everything
		position: absolute;
		z-index: 1000;

		// box settings
		border-color: var(--nw-select-box-border-color);
		border-style: dashed;
		border-width: var(--nw-select-box-border-width);
		background-color: var(--nw-select-box-b-g-color);
		
		// don't interact with mouse events
		pointer-events: none;
		
	}// .select-box

</style>
