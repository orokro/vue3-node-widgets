<!--
	NDefaultWidget.vue
	------------------

	All the built-in types will come with built-in widgets to display in the generic node UI.

	However, if a user creates a type and doesn't provide a custom widget compenent, this
	will render. It's essentually just a null/placeholder widget.
-->
<template>

	<div class="n-default-widget" :style="{
		'text-align': align,
	}">
		<span>{{node.static.nodeName }}</span>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted } from 'vue';

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
});

</script>
<style lang="scss" scoped>

	.n-default-widget {

		padding: 3em 6em;

		span {
			font-size: 16em;
		}

	}// .n-default-widget

</style>
