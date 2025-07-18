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

				<div class="list-item">

					<!-- the icon box -->
					<div class="icon-box">
						<i class="material-icons">{{ t.isDefined(item.item) ? 'polyline' : 'folder' }}</i>
					</div>

					{{ item.name }}

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
				border-radius: 8px 8px 0px 0px;
			}
			&:last-child {
				border-radius: 0px 0px 8px 8px;
			}

			// so we can position children abso-lutely
			position: relative;

			// nice bg styles
			background: rgba(0, 0, 0, 0.5);
			&:nth-child(odd) {
				background: rgba(0, 0, 0, 0.65);
			}

			backdrop-filter: blur(5px);

			color: white;
			font-weight: bolder;

			padding: 5px 45px 5px 45px;
			cursor: pointer;

			// icon box fixed on left, before text
			.icon-box {
				position: absolute;
				left: 10px;
				top: 50%;
				transform: translateY(-50%);
				font-size: 20px;
			}// .icon-box

			// menu arrow fixed on right, after text
			.menu-arrow {
				position: absolute;
				right: 10px;
				top: 50%;
				transform: translateY(-50%);
				font-size: 20px;
			}// .menu-arrow

			// fix submneu on the right
			.sub-menu {

				// hidden by default
				display: none;

				position: absolute;
				right: 5px;
				top: 0px;
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
