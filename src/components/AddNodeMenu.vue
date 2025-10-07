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
		@click="closeAndReset"
		@click.right="repositionMenu" 
		@mouseup.stop
		@contextmenu="$event.preventDefault()"
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

// reference to various elements
const menuEl = ref(null);
const containerPopupEl = ref(null);	
const searchBoxEl = ref(null);

// true if we are right-aligned
const isRightAligned = ref(false);

// compute either the results of a search query, or the full menu hierarchy
const rootMenuItems = computed(() => {

	// otherwise, filter the menu hierarchy based on the search query
	return filterMenuItems(menuOptions.value.availableNodes, searchQuery.value);
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
	console.log("AddNodeMenu mounted, isInternalMount:", props.internalMount);

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
 * Repositions the menu to the new mouse position
 * 
 * @param {MouseEvent} event - The mouse event that triggered the reposition
 */
function repositionMenu(event){

	/*
		NOTE:
		If the user right-clicks over a different instance of NWEditorGraph,
		then the will reposition in the original context it was opened in.

		This might be misleading, but it's a rare use-case.

		Probably should come up with a strategy for this someday, but for now,
		it's not a big deal.
	*/

	// save old options
	const options = menuOptions.value;

	// close currently open menu
	closeMenu();

	// get new position
	const rect = menuEl.value.getBoundingClientRect();
	const spawnX = (event.clientX - rect.left);
	const spawnY = (event.clientY - rect.top);

	// update just the x/y - menu is already open so we don't need to do anything else
	options.x = spawnX;
	options.y = spawnY;
	showAddMenu(options);

	// delay focus to allow the menu to render
	nextTick(() => {
		searchBoxEl.value.focus();
		searchQuery.value = '';

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

	if(menuOptions.value==null || graphCtx.value==null) {
		return [];
	}

	// prepare some info about the query & graph context
	const sanitizedQuery = query.trim().toLowerCase();
	const queryIsEmpty = sanitizedQuery.length===0;
	const outsideGroup = graphCtx.value.graph.subGraph==false;
	const insideGroup = graphCtx.value.graph.subGraph==true;

	/*
		nwSystem.availableNodes.value
		will be an array of objects with the following structure:
		{
			menuPath: 'Path/To/Node',
			class: NodeClassReference
		}

		filter this array into a new array,
		where we do a match based on it's class.nodeName
	*/	
	let filteredItems = items.filter(item => {
		
		// get some info about the item		
		const isInputType = item.class.nodeType===NODE_TYPE.INPUT;
		const isOutputType = item.class.nodeType===NODE_TYPE.OUTPUT;
		const isIOType = isInputType || isOutputType;		
		const itemIsSubGraphOnly = item.class.isSubGraphOnly===true;

		// true if we match the query
		const matchesQueryFilter = queryIsEmpty || item.class.nodeName.toLowerCase().includes(sanitizedQuery);

		// true if we're outside a group & the node isn't specifically for sub-graphs
		const outsideGroupFilter = outsideGroup && itemIsSubGraphOnly==false;
		
		// true if we're inside a group & the node is either not an IO, or it is an IO type but it's a subgraph node
		const insideGroupFilter = insideGroup && (isIOType==false || (isIOType && itemIsSubGraphOnly));
		
		// if we match the query, and we're either outside a group & the node isn't specifically for sub-graphs
		const passesAllFilters = matchesQueryFilter && (outsideGroupFilter || insideGroupFilter);

		return passesAllFilters;
	});

	// convert the flat array into a nested object
	return _buildMenuHierarchy(filteredItems);
}


// watch when the menu becomes visible & focus the search box
watch(() => menuIsOpen.value, async (newVal) => {
	
	// clear the search query
	searchQuery.value = '';

	// if the menu is shown, focus the search box
	if (newVal && searchBoxEl.value) {

		// delay focus to allow the menu to render
		nextTick(() => {
			searchBoxEl.value.focus();
			searchQuery.value = '';

			fitMenu();
		});
	}
});


// loop over a flat array of items and build a nested object
function _buildMenuHierarchy(flatArray) {
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

		}// next i

	}// next { menuPath, class: classRef}

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
	searchQuery.value = '';
	closeMenu();
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

		// for debug
		/* background: rgba(0,0, 0, 0.5); */
		font-size: 1px;

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

		// the box where we'll spawn our menu list components.
		// this is the box that is offset with the x/y coordinates
		.menu-container {

			position: absolute;

			// for debug
			min-width: 210em;
			min-height: 10em;

		}// .menu-container

	}// .add-node-menu-layer

</style>
