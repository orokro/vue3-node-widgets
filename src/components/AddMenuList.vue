<!--
	AddMenuList.vue
	---------------

	This file will spawn the list of menu items and sub-menu items in our AddNodeMenu.vue component.

-->
<template>

	<div
		class="list-container"
		:class="{ 'right-aligned': rightAligned }"
	>

		<div class="list-items">

			<!-- loop over the list items and display them -->
			<template v-for="(item, index) in listItems" :key="index">

				<div 
					class="list-item"
					:class="{ 
						'selected': item.id === selectedItemId,
						'opened': isOpenedMenu(item.id)
					}"
					@click.stop="e=>addNode(e, item)"
					@mouseover="$emit('item-hover', item)"
				>

					<!-- the icon box -->
					<div class="icon-box">
						<i class="material-icons">{{ t.isDefined(item.item) ? 'polyline' : 'folder' }}</i>
					</div>

					<span class="item-name">
						{{ item.name }}
					</span>

					<!-- if it's a menu, we should show an arrow also -->
					<div class="menu-arrow" v-if="t.isDefined(item.items)">
						<i class="material-icons">arrow_forward_ios</i>
					</div>

					<!-- if this item has children, we should render them as a sub-menu -->
					<div v-if="t.isDefined(item.items)" class="sub-menu">
						<AddMenuList 
							:nwSystem="nwSystem"
							:graphCtx="graphCtx"
							:listItems="item.items"
							:selectedItemId="selectedItemId"
							:openedSubMenus="openedSubMenus"
							@item-hover="$emit('item-hover', $event)"
						/>
					</div>
				</div>

			</template>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed } from 'vue';

// our app composables / utils
import { useAddMenu } from '@Composables/useAddMenu.js';
import { ensureFit } from '@/misc/ensureFit';

// external libs/misc
import t from 'typical';

const props = defineProps({

	// reference to the NWEditor instance
	nwSystem: {
		type: Object,
		required: true
	},

	// the list of available nodes to display
	listItems: {
		type: Array,
		default: () => []
	},

	// the current graph context for the menu
	graphCtx: {
		type: Object,
		required: true
	},

	// true if this menu is right-aligned
	rightAligned: {
		type: Boolean,
		default: false
	},

	// string of the currently selected item (if any)
	selectedItemId: {
		type: String,
		default: null
	},

	// array of opened menu ids
	openedSubMenus: {
		type: Array,
		default: () => []
	}
});


// add emit for when the mouse moves over an item
const emits = defineEmits(['item-hover']);

const { closeMenu } = useAddMenu(props.nwSystem);

/**
 * Adds a node to the graph (if its an item and not a menu)
 * @param item - The item to add
 */
function addNode(event, item){

	// if it doesn't have the item key, it was probably a menu item
	if (!t.isDefined(item.item)) {
		// console.warn('Tried to add a menu item, but it does not have an item key:', item);
		return;
	}

	const graph = props.graphCtx.graph;
	const pos = props.graphCtx.spawn;
	const ctx = props.graphCtx.ctx;

	// add the item & close the menu
	graph.addNode(item.item, pos.x, pos.y);
	closeMenu();
}

// helpers / computed
const isOpenedMenu = (itemID) => {
	return props.openedSubMenus.includes(itemID);
};


</script>
<style lang="scss" scoped>

	// container for this list of menu items...
	.list-container {

		// for debug
		// border: 2px solid black;

		// actual rows in the table
		.list-item {

			// white-space: nowrap;
			// width: max-content;

			&:first-child {
				border-radius: 8em 8em 0em 0em;
			}
			&:last-child {
				border-radius: 0em 0em 8em 8em;
			}
			&:only-child {
				border-radius: 8em;
			}

			// so we can position children abso-lutely
			position: relative;

			// nice bg styles
			background: rgba(0, 0, 0, 0.85);

			.item-name {
				font-size: 14em;
			}

			backdrop-filter: blur(5px);

			color: white;
			font-weight: bolder;

			padding: 5em 45em 5em 40em;
			cursor: pointer;

			// icon box fixed on left, before text
			.icon-box {
				position: absolute;
				left: 10em;
				top: 50%;
				transform: translateY(-50%);
				
				i {
					font-size: 20em;
				}
			}// .icon-box

			// menu arrow fixed on right, after text
			.menu-arrow {

				padding-top:4em;
				position: absolute;
				right: 10em;
				top: 50%;
				transform: translateY(-50%);
				i {
					font-size: 20em;
				}

			}// .menu-arrow

			// fix submenu on the right
			.sub-menu {
				
				// hidden by default
				display: none;

				position: absolute;
				right: 0em;

				top: 0em;
				// width: 200px; // fixed width for sub-menus
				width: max-content;
				transform: translateX(100%);

			}// .sub-menu

			&:hover, &.opened, &.selected {

				background-color: #f0f0f0FF;
				color: black;
				backdrop-filter: blur(5px) !important;

				&>.sub-menu {
					display: block;
				}
			}

			&.opened {
				background-color: #c0c0c0ff;
				/* color: red; */
			}

			&:active {
				background-color: #d0d0d0af;
				backdrop-filter: blur(5px);
				color: black;
			}

		}// .list-item

		// if we're right-aligned, we need to adjust some styles
		&.right-aligned {

			.list-item {

				padding: 5em 45em 5em 60em;

				.icon-box {	
					left: 30em;

				}// .icon-box

				.menu-arrow {

					left: 5em;
					right: auto;

					transform: scaleX(-1) translateY(-50%);
				}// .menu-arrow

				.sub-menu {

					right: auto;
					left: 0em;
					transform: translateX(-100%);

				}// .sub-menu 

			}// .list-item

		}// &.right-aligned

	}// .list-container

</style>
