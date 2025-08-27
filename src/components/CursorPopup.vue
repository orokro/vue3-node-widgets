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
		{{ text }}
	</div>
</template>
<script setup>

// vue
import { ref, onMounted, inject } from 'vue';

// get our drag helper
const dragHelper = inject('dh');

const text = ref('tool tip');
const xPos = ref(0);
const yPos = ref(0);
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

const hide = () => {
	visible.value = false;
}

defineExpose({
	show,
	hide
});


</script>
<style lang="scss" scoped>

	.tool-tip-box {

		// fixed b/c cursor is screen space
		position: fixed;

		border-radius: 5px;
		box-shadow: 3px 3px 10px rgba(0,0,0,0.2);
		padding: 0.3em 1em;
		background: rgba(0,0,0,0.8);
		color: white;
		font-size: 1em;
		
	}// .tool-tip-box

</style>