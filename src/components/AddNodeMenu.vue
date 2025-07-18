<!--
	AddNodeMenu.vue
	---------------

	This will be the menu that lets the user add nodes to the graph.

-->
<template>
	
	<!-- outer most wrapper, fill parent div -->
	<div class="add-node-menu-layer">

		
	</div>

</template>
<script setup>

// vue
import { ref, shallowRef, watch } from 'vue';

// define some props
const props = defineProps({

	// reference to the NWEditor instance
	nwSystem: {
		type: Object,
		required: true
	},
});

const menuHeirarchy = shallowRef([]);


function buildMenu(items) {

	const root = {};

	for (const item of items) {
		const parts = item.menuPath
			.replace(/^\/|\/$/g, '') // trim leading/trailing slashes
			.split('/')
			.map(part =>
				part
					.toLowerCase()
					.replace(/\b\w/g, c => c.toUpperCase()) // capitalize words
			);

		let current = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			if (!current[part]) {
				current[part] = {};
			}

			if (i === parts.length - 1) {
				if (!current[part].__items) {
					current[part].__items = [];
				}
				current[part].__items.push(item.class);
			}

			current = current[part];
		}
	}

	return root;
}

function buildMenuHeirarchy(availableNodes) {

	console.log('building menu heirarchy');
	console.log(availableNodes);
	menuHeirarchy.value = buildMenu(availableNodes);

	console.log(menuHeirarchy.value);
};






watch(() => props.nwSystem.availableNodes.value, (newVal) => {

	buildMenuHeirarchy(newVal);
}, { immediate: true });

</script>
<style lang="scss" scoped>

	.add-node-menu-layer {


		// fill parent
		position: absolute;
		inset: 0px 0px 0px 0px;

		// for debug
		background: rgba(0,0, 0, 0.5);

	}// .add-node-menu-layer

</style>
