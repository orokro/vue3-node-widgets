<!--
	AddNodeMenu.vue
	---------------

	This will be the menu that lets the user add nodes to the graph.

-->
<template>

	<!-- outer most wrapper, fill parent div -->
	<div v-show="nwSystem.showMenu.value" class="add-node-menu-layer" @click="closeMenu"
		@click.right="nwSystem.showMenu.value && closeMenu" @mouseup.stop>

		<div class="menu-container" @click.stop :style="{
				left: `${nwSystem.menuX.value}px`,
				top: `${nwSystem.menuY.value}px`,
			}">

			<!-- search box -->
			<div class="search-box">

				<div class="icon-box">
					<i class="material-icons">search</i>
				</div>

				<div class="search-input-wrapper">
					<input ref="searchBoxEl" type="text" placeholder="Search for a node..." v-model="searchQuery" />
				</div>
			</div>

			<!-- this will spawn the list of menu items and sub-menu items -->
			<AddMenuList :nwSystem="nwSystem" :listItems="rootMenuItems" />
		</div>
	</div>

</template>
<script setup>

// vue
import { ref, shallowRef, watch, computed } from 'vue';

// components
import AddMenuList from '@Components/AddMenuList.vue';

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

// search query
const searchQuery = ref('');

// reference to our search box
const searchBoxEl = ref(null);

// compute either the results of a search query, or the full menu heirarchy
const rootMenuItems = computed(() => {

	// if the search query is empty, return the full menu heirarchy
	if (searchQuery.value.trim() === '') {
		return menuHeirarchy.value;
	}

	// otherwise, filter the menu heirarchy based on the search query
	return filterMenuItems(props.nwSystem.availableNodes.value, searchQuery.value);
});


/**
 * Filters the menu items based on the search query
 * 
 * @param {Array} items - The menu items to filter
 * @param {string} query - The search query
 * @returns {Array} - The filtered menu items
 */
function filterMenuItems(items, query) {
	const sanitizedQuery = query.trim().toLowerCase();

	/*
		props.nwSystem.availableNodes.value
		will be an array of objects with the following structure:
		{
			menuPath: 'Path/To/Node',
			class: NodeClassReference
		}

		filter this array into a new array,
		where we do a match based on it's class.nodeName
	*/	
	let filteredItems = items.filter(item => {
		return item.class.nodeName.toLowerCase().includes(sanitizedQuery);
	});
	console.log('filteredItems', filteredItems);

	// convert the flat array into a nested object
	return buildMenuHierarchy(filteredItems);
}

// watch when the menu becomes visible & focus the search box
watch(() => props.nwSystem.showMenu.value, (newVal) => {

	
	// if the menu is shown, focus the search box
	if (newVal && searchBoxEl.value) {

		console.log('focusing search box');
		// delay focus to allow the menu to render
		setTimeout(() => {
			searchBoxEl.value.focus();
			searchQuery.value = '';
		}, 100);
	}
});

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


/**
 * Closes the menu
 */
function closeMenu() {
	props.nwSystem.showMenu.value = false;
}

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
		// background: rgba(0,0, 0, 0.5);
		font-size: 1px;

		// search box on top
		.search-box {

			position: relative;
			background: rgba(0, 0, 0, 0.5);
			padding: 8em;
			border-radius: 8em;
			height: 25em;

			margin-bottom: 8em;

			// search icon
			.icon-box {

				position: absolute;
				inset: 0em auto 0em 0em;
				width: 45em;
				color: white;
				
				i {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					font-size: 28em;
				}// i

			}// .icon-box

			// wrapper so we can use em for the box, but keep its
			// font size larger/intact
			.search-input-wrapper {

				// fixed area
				position: absolute;
				inset: 5em 5em 5em 45em;
				
				// camp corners of box
				padding: 4em;
				border-radius: 4em;
				overflow: hidden;

				border: 1em solid #ccc;

				// the input box	
				input {
					position: absolute;
					inset: 0px 0px 0px 0px;

					outline: none;
					border: 0px none;
					background: rgba(255, 255, 255, 0.8);

					font-size: 15em;
				}// input

			}// .search-input-wrapper

		}// .search-box

		// the box where we'll spawn our menu list components.
		// this is the box that is offset with the x/y coordinates
		.menu-container {

			position: absolute;

			// for debug
			min-width: 300em;
			min-height: 10em;
			// border: 1px solid red;

		}// .menu-container

	}// .add-node-menu-layer

</style>
