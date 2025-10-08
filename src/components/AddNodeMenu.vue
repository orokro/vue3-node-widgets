<!--
	AddNodeMenu.vue
	---------------

	This will be the menu that lets the user add nodes to the graph.

-->
<template>

	<!-- outer most wrapper, fill parent div -->
	<div 
		v-show="menuIsOpen"
		ref="menuEl"
		class="add-node-menu-layer"
		:class="{ 'right-aligned': isRightAligned }"
		@keydown="handleKeyDown"
	>
		<div 
			ref="containerPopupEl"
			class="menu-container" 
			@click.stop 
			:style="{
				left: `${menuX}px`,
				top: `${menuY}px`,
			}"
		>	
			<!-- search box -->
			<div class="search-box">

				<div class="icon-box">
					<i class="material-icons">search</i>
				</div>

				<div class="search-input-wrapper">
					<input 
						ref="searchBoxEl"
						type="text"
						placeholder="Search for a node..."
						v-model="searchQuery"
						@blur="closeAndReset"
					/>
				</div>

			</div>

			<!-- this will spawn the list of menu items and sub-menu items -->
			<AddMenuList
				v-if="graphCtx != null && nwSystem != null"
				:nwSystem="nwSystem"
				:graphCtx="graphCtx"
				:listItems="rootMenuItems"
				:containerEl="menuEl"
				:right-aligned="isRightAligned"
				:selectedItemId="selectedItemId"
				:openedSubMenus="openedSubMenus"
				@item-hover="handleItemHover"
			/>
			
		</div>
	</div>

</template>
<script setup>

// vue
import { ref, shallowRef, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';

// components
import AddMenuList from '@Components/AddMenuList.vue';
import { NODE_TYPE } from '@/classes/NWNode';

// our app / composables
import { useAddMenu } from '@/composables/useAddMenu';
import { ensureFit } from '@/misc/ensureFit';

// define props
const props = defineProps({

	// if true, this instance is being mounted internally by the app
	internalMount: {
		type: Boolean,
		default: false
	}
});

// import our global menu manager
const {
	setMountedMenu,
	clearMountedMenu,
	closeMenu,
	menuIsOpen,
	menuOptions,
	manuallyMounted,
	showAddMenu,
} = useAddMenu();

// store the hierarchy of the menu
const menuHierarchy = shallowRef([]);

// search query
const searchQuery = ref('');

// selected item ID for keyboard nav
const selectedItemId = ref(null);

// list of submenus that were opened via keyboard
const openedSubMenus = ref([]);

// reference to various elements
const menuEl = ref(null);
const containerPopupEl = ref(null);	
const searchBoxEl = ref(null);

// true if we are right-aligned
const isRightAligned = ref(false);

// compute either the results of a search query, or the full menu hierarchy
const rootMenuItems = computed(() => {

	// otherwise, filter the menu hierarchy based on the search query
	const items = filterMenuItems(menuOptions.value.availableNodes, searchQuery.value);

	// if we have a search query, select the first items ID, otherwise, clear it
	if(searchQuery.value.length > 0 && items.length > 0) {
		selectedItemId.value = items[0].id;
	} else {
		selectedItemId.value = null;
	}

	return items;
});


// When the composable signals that the menu is open,
// use the menuOptions to get the position info dynamically.
const menuX = computed(() => menuOptions.value?.x ?? 0);
const menuY = computed(() => menuOptions.value?.y ?? 0);
const nwSystem = computed(() => menuOptions.value?.nwSystem ?? null);
const graphCtx = computed(() => menuOptions.value?.graphCtx ?? null);

// Lifecycle hooks
onMounted(() => {

	// register this instance as the active menu
	setMountedMenu({ el: menuEl.value });

	// for debug
	// console.log("AddNodeMenu mounted, isInternalMount:", props.internalMount);

	// if we weren't mounted internally by the app
	if( props.internalMount === false ) {
		
		// we've manually mounted
		manuallyMounted.value = true;
	}
});


onUnmounted(() => {
	clearMountedMenu();
	manuallyMounted.value = false;
});


/**
 * Ensures the menu fits within the viewport
 * and updates the isRightAligned ref accordingly
 */
async function fitMenu(){
	
	const fitResults = await ensureFit(containerPopupEl, menuEl, 8);
	isRightAligned.value = fitResults.x < 0;	
}


/**
 * Resets the search box, selected item, opened submenus,
 */
function resetAndFit(){

	// delay focus to allow the menu to render
	nextTick(() => {
		searchBoxEl.value.focus();
		searchQuery.value = '';
		selectedItemId.value = null;
		openedSubMenus.value = [];
		fitMenu();
	});
}


/**
 * Filters the menu items based on the search query
 * 
 * @param {Array} items - The menu items to filter
 * @param {string} query - The search query
 * @returns {Array} - The filtered menu items
 */
 function filterMenuItems(items, query) {

	if (menuOptions.value == null || graphCtx.value == null) {
		return [];
	}

	const sanitizedQuery = query.trim().toLowerCase();
	const queryIsEmpty = sanitizedQuery.length === 0;
	const outsideGroup = graphCtx.value.graph.subGraph === false;
	const insideGroup = graphCtx.value.graph.subGraph === true;

	// step 1: apply your same filtering rules
	let filteredItems = items.filter(item => {
		const isInputType = item.class.nodeType === NODE_TYPE.INPUT;
		const isOutputType = item.class.nodeType === NODE_TYPE.OUTPUT;
		const isIOType = isInputType || isOutputType;
		const itemIsSubGraphOnly = item.class.isSubGraphOnly === true;

		const matchesQueryFilter =
			queryIsEmpty || item.class.nodeName.toLowerCase().includes(sanitizedQuery);

		const outsideGroupFilter = outsideGroup && itemIsSubGraphOnly == false;
		const insideGroupFilter =
			insideGroup && (isIOType == false || (isIOType && itemIsSubGraphOnly));

		return matchesQueryFilter && (outsideGroupFilter || insideGroupFilter);
	});

	// step 2: convert into hierarchy
	const hierarchy = _buildMenuHierarchy(filteredItems);

	// step 3: if no query, return hierarchy as usual
	if (queryIsEmpty) return hierarchy;

	// step 4: flatten all leaf nodes and compute match scores
	const flat = [];
	function collectLeaves(arr) {

		for (const entry of arr) {

			if (entry.items && entry.items.length) {
				collectLeaves(entry.items);

			} else if (entry.item) {
				const name = entry.name.toLowerCase();
				const matchIndex = name.indexOf(sanitizedQuery);
				const score = matchIndex === -1 ? 0 : 1 / (matchIndex + 1); // earlier match = higher score
				flat.push({
					id: entry.id,
					name: entry.name,
					item: entry.item,
					score,
				});
			}

		}// next entry
	}
	collectLeaves(hierarchy);

	// step 5: sort by score and alphabetically
	flat.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

	return flat;
}


// watch when the menu becomes visible & focus the search box
watch(() => menuIsOpen.value, async (newVal) => {
	
	// clear the search query
	searchQuery.value = '';

	// if the menu is shown, focus the search box
	if (newVal && searchBoxEl.value)
		resetAndFit();	
	
});


// Generate a stable unique ID based on type + path + name
function makeID(type, fullPath) {
	let base = `${type}:${fullPath}`;
	let hash = 0;
	for (let i = 0; i < base.length; i++) {
		hash = (hash << 5) - hash + base.charCodeAt(i);
		hash |= 0;
	}
	return `${type}-${Math.abs(hash)}`;
}


/**
 * Builds a nested menu hierarchy that supports:
 * - Root-level items (menuPath = "/")
 * - Unique group and item IDs based on full path
 * - Duplicate items allowed in different paths
 */
function _buildMenuHierarchy(flatArray) {
	const root = [];

	// Utility to sanitize path segments to Title Case
	function sanitize(segment) {
		return segment
			.trim()
			.toLowerCase()
			.replace(/(^\w|\s\w)/g, c => c.toUpperCase());
	}

	// Find or create a group node at a given path
	function getOrCreate(items, name, fullPath) {
		let existing = items.find(i => i.name === name && i.path === fullPath);
		if (!existing) {
			existing = { id: makeID('group', fullPath), name, path: fullPath, items: [] };
			items.push(existing);
		}
		return existing;
	}

	for (const { menuPath, class: classRef } of flatArray) {
		const nodeName = classRef.nodeName;
		const sanitizedPath = (menuPath || '/').trim();

		// Handle root-level items (menuPath === "/" or empty)
		if (sanitizedPath === '/' || sanitizedPath === '') {
			root.push({
				id: makeID('item', `/${nodeName}`),
				name: nodeName,
				item: classRef,
				path: '/',
			});
			continue;
		}

		// Break down into segments and sanitize
		const parts = sanitizedPath.split('/').filter(Boolean).map(sanitize);

		let currentLevel = root;
		let currentPath = '';

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			currentPath += `/${part}`;

			if (i === parts.length - 1) {
				// This segment is the group under which we add the item
				const container = getOrCreate(currentLevel, part, currentPath);
				const itemFullPath = `${currentPath}/${nodeName}`;
				container.items.push({
					id: makeID('item', itemFullPath),
					name: nodeName,
					item: classRef,
					path: itemFullPath,
				});
			} else {
				currentLevel = getOrCreate(currentLevel, part, currentPath).items;
			}
		}
	}

	return root;
}


/**
 * Builds out the ref we'll consume in the template to render the menu hierarchy
 * 
 * @param availableNodes - The list of available nodes to build the menu from
 */
function buildMenuHierarchy(availableNodes) {
	menuHierarchy.value = _buildMenuHierarchy(availableNodes);
};


// watch the available nodes on the NWSystem instance
// while they probably wont change live at runtime, we still want to
// build the menu hierarchy when the component is mounted
// and when the available nodes change
watch(() => menuOptions, (newVal) => {

	// build the menu hierarchy
	buildMenuHierarchy(menuOptions.value.availableNodes);

}, { immediate: true });


/**
 * Closes the menu and resets the search query
 */
function closeAndReset() {

	nextTick(()=>{
		searchQuery.value = '';
		closeMenu();
	});
}


/**
 * Helps find an item by its ID in the root menu items
 * 
 * @param id - The ID of the item to find
 */
function getItemByID(id){

	if(id == null || rootMenuItems.value == null)
		return null;

	// search the root menu items recursively
	function search(items){
		for(const item of items){
			if(item.id === id){
				return item;
			}
			if(item.items){
				const found = search(item.items);
				if(found) return found;
			}
		}
		return null;
	}

	return search(rootMenuItems.value);
}


/**
 * Get's the sibling items of an item.
 * 
 * It will find the item in the hierarchy and get the sibling before (above) & after (below) it.
 * If it's the first item in the list, it will not have a previous sibling.
 * If it's the last item in the list, it will not have a next sibling.
 * If the item is a group, it will also have a 'right' sibling which is the first item in the group.
 * If the item itself is inside a group, it will also have a 'left' sibling which is the parent group.
 * @param {string|object} item - the id string or the item object itself
 * @returns {object} - An object with the sibling items: { above, below, left, right }
 */
function getItemSiblings(item){

	if(item == null || rootMenuItems.value == null)
		return {};

	// if we were given an ID, find the item first
	if(typeof item === 'string'){
		item = getItemByID(item);
		if(item == null)
			return {};
	}

	let parent = null;
	let index = -1;

	// search the root menu items recursively to find the parent & index
	function search(items, parentItem){
		for(let i = 0; i < items.length; i++){
			const currentItem = items[i];
			if(currentItem.id === item.id){
				parent = parentItem;
				index = i;
				return true;
			}
			if(currentItem.items){
				if(search(currentItem.items, currentItem)){
					return true;
				}
			}
		}
		return false;
	}

	search(rootMenuItems.value, null);

	if(index === -1)
		return {};

	const siblings = {};

	// get above sibling
	if(index > 0){
		siblings.above = parent ? parent.items[index - 1] : rootMenuItems.value[index - 1];
	}

	// get below sibling
	if(parent){
		if(index < parent.items.length - 1){
			siblings.below = parent.items[index + 1];
		}
	} else {
		if(index < rootMenuItems.value.length - 1){
			siblings.below = rootMenuItems.value[index + 1];
		}
	}

	// get left sibling (parent group)
	if(parent){
		siblings.left = parent;
	}

	// get right sibling (first item in group)
	if(item.items && item.items.length > 0){
		siblings.right = item.items[0];
	}

	return siblings;
}


/**
 * When the user does keyboard navigation, sometimes they can go into / out of submenus.
 * When they do, we need to find the currently selected item & then compute it's parents chain.
 * The will be set to the array openedSubMenus ref so the template can open those submenus.
 * 
 * @param {string|object} item - the id string or the item object itself
 */
function openParentMenus(item){

	if(item == null || rootMenuItems.value == null)
		return;

	// if we were given an ID, find the item first
	if(typeof item === 'string'){
		item = getItemByID(item);
		if(item == null)
			return;
	}

	const parents = [];

	// search the root menu items recursively to find the parent chain
	function search(items, parentItem){
		for(const currentItem of items){
			if(currentItem.id === item.id){
				if(parentItem){
					parents.push(parentItem);
				}
				return true;
			}
			if(currentItem.items){
				if(search(currentItem.items, currentItem)){
					if(parentItem){
						parents.push(parentItem);
					}
					return true;
				}
			}
		}
		return false;
	}

	search(rootMenuItems.value, null);

	// reverse the parents array so it's in order from root to leaf
	parents.reverse();

	// set the opened submenus to the parents chain
	openedSubMenus.value = parents.map(p => p.id);
}


/**
 * Handles key down events for the menu
 * 
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyDown(event) {

	// close if the user hits escape
	if(event.key === 'Escape') {
		closeAndReset();
		return;
	}

	// if the user hits enter, and we have a selected item, add it to the graph
	if(event.key === 'Enter' && selectedItemId.value != null) {

		const item = getItemByID(selectedItemId.value);
		if(item != null && item.item != null && graphCtx.value != null) {

			// add the node to the graph
			graphCtx.value.graph.addNode(item.item, graphCtx.value.spawn.x, graphCtx.value.spawn.y);

			// close the menu
			closeAndReset();
		}

		return;
	}

	// if the user hits up/down/left/right, navigate the menu
	if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {

		let key = event.key;

		// if we're right-aligned, swap left/right
		if(isRightAligned.value) {
			if(key === 'ArrowLeft')
				key = 'ArrowRight';
			else if(key === 'ArrowRight')
				key = 'ArrowLeft';
		}

		if(selectedItemId.value == null) {
			
			// select first item & gtfo
			if(rootMenuItems.value.length > 0) {
				selectedItemId.value = rootMenuItems.value[0].id;
				openParentMenus(selectedItemId.value);
				return;
			}
		}

		const currentItem = getItemByID(selectedItemId.value);
		if(currentItem == null) return;

		const siblings = getItemSiblings(currentItem);

		switch(key) {
			case 'ArrowUp':
				if(siblings.above) {
					selectedItemId.value = siblings.above.id;
				}
				break;
			case 'ArrowDown':
				if(siblings.below) {
					selectedItemId.value = siblings.below.id;
				}
				break;
			case 'ArrowLeft':
				if(siblings.left) {
					selectedItemId.value = siblings.left.id;
				}
				break;
			case 'ArrowRight':
				if(siblings.right) {
					selectedItemId.value = siblings.right.id;
				}
				break;
		}

		openParentMenus(selectedItemId.value);

		event.preventDefault();
	}
}


/**
 * When the user hovers over an item with the mouse,
 * we want to clear the keyboard selection & opened submenus
 * since the mouse is now active.
 * 
 * @param {object} item - The item that was hovered over
 */
function handleItemHover(item){

	// clear keyboard select since mouse is active
	selectedItemId.value = null;
	openedSubMenus.value = [];
}

</script>
<style lang="scss" scoped>

	// main outer-layer of the component
	// this will fill the entire parent container to capture
	// mouse events when necessary
	.add-node-menu-layer {

		// fill parent
		position: fixed;
		inset: 0px 0px 0px 0px;
		z-index: 9001;

		pointer-events: none;

		// for debug
		/* background: rgba(0,0, 0, 0.5); */
		font-size: 1px;

		// the box where we'll spawn our menu list components.
		// this is the box that is offset with the x/y coordinates
		.menu-container {

			position: absolute;

			// for debug
			min-width: 210em;
			min-height: 10em;

			pointer-events: initial;

			// search box on top
			.search-box {

				position: relative;
				background: rgba(0, 0, 0, 0.85);
				padding: 8em;
				border-radius: 8em;
				height: 30em;

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

		}// .menu-container

	}// .add-node-menu-layer

</style>
