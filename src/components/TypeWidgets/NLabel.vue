<!--
	NLabel.vue
	----------

	When a node has a label, this component is used to display it.
-->
<template>

	<div 
		class="n-label"
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

	.n-label {

		padding: 3em 6em;
		
		span {
			font-size: 12em;
		}

	}// .n-label
</style>
