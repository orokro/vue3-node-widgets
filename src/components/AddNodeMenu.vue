<!--
	AddNodeMenu.vue
	---------------

	This will be the menu that lets the user add nodes to the graph.

-->
<template>
	
	<!-- outer most wrapper, fill parent div -->
	<div 
		v-show="menuOpen"
		class="add-node-menu-layer"
	>

		
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

// store the heirarchy of the menu
const menuHeirarchy = shallowRef([]);

const menuOpen = ref(true);


// loop over a flat array of items and build a nested object
function buildMenuHierarchy(flatArray) {
	const root = [];

	// Utility to sanitize path segments to Title Case
	function sanitize(segment) {
		return segment
			.trim()
			.toLowerCase()
			.replace(/(^\w|\s\w)/g, c => c.toUpperCase());
	}

	// Utility to find or create a node at current level
	function getOrCreate(items, name) {
		let existing = items.find(i => i.name === name && i.items);
		if (!existing) {
			existing = { name, items: [] };
			items.push(existing);
		}
		return existing;
	}

	for (const { menuPath, class: classRef } of flatArray) {
		const nodeName = classRef.nodeName;
		const parts = menuPath.split('/').filter(Boolean).map(sanitize);

		let currentLevel = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			if (i === parts.length - 1) {
				// Last segment — we insert the leaf node (class here)
				const container = getOrCreate(currentLevel, part);
				container.items.push({ name: nodeName, item: classRef });
			} else {
				// Walk/create directory
				currentLevel = getOrCreate(currentLevel, part).items;
			}
		}
	}

	return root;
}



/**
 * Builds out the ref we'll consume in the template to render the menu heirarchy
 * 
 * @param availableNodes - The list of available nodes to build the menu from
 */
function buildMenuHeirarchy(availableNodes) {

	menuHeirarchy.value = buildMenuHierarchy(availableNodes);
};

// watch the available nodes on the NWSystem instance
// while they probabaly wont change live at runtime, we still want to
// build the menu heirarchy when the component is mounted
// and when the available nodes change
watch(() => props.nwSystem.availableNodes.value, (newVal) => {

	// build the menu heirarchy
	buildMenuHeirarchy(newVal);

}, { immediate: true });


</script>
<style lang="scss" scoped>

	// main outer-layer of the component
	// this will fill the entire parent container to capture
	// mouse events when necessary
	.add-node-menu-layer {

		// fill parent
		position: absolute;
		inset: 0px 0px 0px 0px;

		// for debug
		background: rgba(0,0, 0, 0.5);

	}// .add-node-menu-layer

</style>
