<!--
	AddMenuList.vue
	---------------

	This file will spawn the list of menu items and sub-menu items in our AddNodeMenu.vue component.

-->
<template>

	<div class="list-container">

		<div class="list-items">

			<!-- loop over the list items and display them -->
			<template v-for="(item, index) in listItems" :key="index">

				<div class="list-item" @click.stop="addNode(item)">

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
							:listItems="item.items"
						/>
					</div>
				</div>

			</template>

		</div>
	</div>

</template>
<script setup>

import { ref, onMounted } from 'vue';

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

});


/**
 * Adds a node to the graph (if its an item and not a menu)
 * @param item - The item to add
 */
function addNode(item){

	// if it doesn't have the item key, it was probably a menu item
	if (!t.isDefined(item.item)) {
		// console.warn('Tried to add a menu item, but it does not have an item key:', item);
		return;
	}

	// add the item!	
	props.nwSystem.addNode(item.item);
}

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
			background: rgba(0, 0, 0, 0.5);
			&:nth-child(odd) {
				background: rgba(0, 0, 0, 0.65);
			}

			.item-name {
				font-size: 20em;
			}

			backdrop-filter: blur(5px);

			color: white;
			font-weight: bolder;

			padding: 5em 45em 5em 45em;
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

			// fix submneu on the right
			.sub-menu {

				// hidden by default
				display: none;

				position: absolute;
				right: 5em;
				top: 0em;
				// width: 200px; // fixed width for sub-menus
				width: max-content;
				transform: translateX(100%);

			}// .sub-menu

			&:hover {
				background-color: #f0f0f057;
				color: black;

				&>.sub-menu {
					display: block;
				}
			}

			&:active {
				background-color: #d0d0d0af;
				color: black;
			}

		}// .list-item

	}// .list-container
</style>
