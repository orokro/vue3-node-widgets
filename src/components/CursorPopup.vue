<!-- 
	CursorPopup.vue
	---------------

	A box to show a tool-tip when connecting sockets,
	to warn if the connection is invalid, or will be converted.
-->
<template>

	<div
		class="tool-tip-box"
		:style="{
			left: `${xPos}px`,
			top: `${yPos}px`,
			display: visible ? 'block' : 'none',
		}"
	>
		<pre>{{ text }}</pre>
	</div>
</template>
<script setup>

// vue
import { ref, onMounted, inject } from 'vue';

// get our drag helper
const dragHelper = inject('dh');

// the text to show
const text = ref('tool tip');

// spawn position
const xPos = ref(0);
const yPos = ref(0);

// we'll stay mounted but only visible when needed
const visible = ref(false);


/**
 * Shows the tool tip
 * 
 * @param {string} text - the text to show in the tooltip
 */
const show = (newText) => {

	// get new x/y pos
	const cursorPos = dragHelper.getCursorPos();
	xPos.value = cursorPos.x;
	yPos.value = cursorPos.y;

	// set text & show
	text.value = newText;
	visible.value = true;
}


/**
 * Hides our tool tip
 */
const hide = () => {
	visible.value = false;
}


// expose show/hide methods
defineExpose({
	show,
	hide
});

</script>
<style lang="scss" scoped>

	// the main box
	.tool-tip-box {

		// don't interfere with mouse events
		pointer-events: none;

		// fixed b/c cursor is screen space
		position: fixed;
		transform: translate(-50%, 10px);

		border-radius: 5px;
		box-shadow: 3px 3px 3px rgba(0,0,0,0.3);
		padding: 0.3em 1em;
		background: rgba(0,0,0,0.75);
		color: white;
		font-size: 1em;
		
		pre {
			font-size: 1.5em;
			letter-spacing: -0.05em;
		}
	}// .tool-tip-box

</style>