<!--
	NFieldNameWidget.vue
	--------------------

	This widget is what we display for:
		- The output fields on input nodes. Just the name of the field, right aligned to the socket.
		- The input fields on output nodes. Just the name of the field, left aligned to the socket.
		- Input nodes that have been wired-into.
		- Output nodes in general (right aligned to the socket).

	This basically just displays the socket name for the row, its value is assumed to be wired in or provided.
-->
<template>

	<div 
		class="n-field-name"
		:style="{
			'text-align': align,
			'--label-text': text
		}"
	>	
		<span>{{ text }}</span>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted } from 'vue';

// props
const props = defineProps({

	// the text to display in the label
	text: {
		type: String,
		default: ''
	},

	// the alignment of the label text
	align: {
		type: String,
		default: 'left'
	},
});

</script>
<style lang="scss" scoped>

	.n-field-name {

		padding: 3em 6em;
		
		span {
			font-size: 12em;
		}

	}// .n-field-name
	
</style>