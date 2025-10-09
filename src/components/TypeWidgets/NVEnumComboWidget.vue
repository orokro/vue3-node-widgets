<!--
    NVEnumComboWidget.vue
    ---------------------

    Custom dropdown replacement for enum values.
-->
<template>

	<div 
		class="n-enum-widget"		
		:style="{ 'text-align': align }"
	>
		<div class="input-wrapper">

			<div class="enum-value-row">

				<div 
					class="gray-wrapper"
					:class="{ 
						'read-only': readOnly ,
						'is-open': isOpen
					}"
				>
					<!-- custom dropdown -->
					<div 
						class="dropdown"
						@click="toggleOpen"
						:class="{ open: isOpen }"
					>
						<div class="selected">{{ items[itemIndex] }}</div>
						<span class="arrow"><span>▼</span></span>
					</div>

					<ul v-if="isOpen" class="dropdown-menu">
						<li 
							v-for="(item, index) in items" 
							:key="index"
							@click="selectItem(index)"
						>
							<span>{{ item }}</span>
						</li>
					</ul>

				</div>
			</div>
		</div>
	</div>
</template>
<script setup>

// vue
import { ref, watch } from "vue";

// props
const props = defineProps({

	node: { 
		type: Object,
		required: true
	},

	field: {
		type: Object,
		required: true
	},

	align: {
		type: String,
		default: "center"
	},

	readOnly: {
		type: Boolean,
		default: false
	},
});

// items
const items = props.field.valueType.items;

// reactive index
const itemIndex = props.node.fieldState[props.field.name].valueRef;

// open/close state
const isOpen = ref(false);


/**
 * Toggle the dropdown open/closed
 */
function toggleOpen() {
	if (!props.readOnly) {
		isOpen.value = !isOpen.value;
	}
}


/**
 * Select an item from the dropdown
 * @param  {Number} index - index of the selected item
 */
function selectItem(index) {
	itemIndex.value = index;
	isOpen.value = false;
}


</script>
<style lang="scss" scoped>

	.n-enum-widget {

		.input-wrapper {

			position: relative;

			.enum-value-row {

				// pill shaped outer wrapper
				.gray-wrapper {

					position: relative;
					border-radius: 10em;
					padding: 0em;
					padding-bottom: 2em;

					// drop down element (previously was a select box)
					.dropdown {

						// box settings
						background: var(--nw-node-input-b-g-color);
						border-radius: 10em;
						padding: 2em 15em 2em 5em;
						
						//layout
						/* display: flex; */
						/* justify-content: space-between; */
						align-items: center;

						// text settings
						color: var(--nw-node-input-text-color);
						
						// look so clickable
						cursor: pointer;

						.selected {
							width: 100%;
							font-size: 12em;
						}

					}// .dropdown

					// arrow on drop down
					.arrow {

						// fixed on right
						position: absolute;
						top: 5em;
						right: 5em;
						width: 10em;

						span {
							font-size: 8em !important;
						}
					}// .arrow

					// when open, change border radius of box & dropdown
					&.is-open {

						padding-bottom: 0em;

						/* display: none; */
						.dropdown {
							border-radius: 10em 10em 0em 0em !important;
							border: 2px solid var(--nw-node-input-separator-color);
							border-bottom: none;
							border-bottom: none;
						}
						.dropdown-menu {
							border-radius: 0em 0em 8em 8em;
						}
					}// .is-open

					// actual list of items that opens
					.dropdown-menu {

						// fixed under the box
						position: absolute;
						top: 100%;
						left: 0;
						right: 0;

						// box settings
						background: var(--nw-node-input-b-g-color);
						border: 2px solid var(--nw-node-input-separator-color);
						border-radius: 0em 0em 8em 8em;
						margin: 0em 0 0 0;
						padding: 0;
						overflow: clip;

						// list settings
						list-style: none;
						z-index: 9999;

						// the list items
						li {
							padding: 4em 8em;
							color: var(--nw-node-input-text-color);
							cursor: pointer;
							span {
								font-size: 12em;
							}
							&:hover {
								background: var(--nw-node-input-accent1);
							}
						}// li
					
					}// .dropdown-menu

				}// .gray-wrapper

			}// .enum-value-row

		}// .input-wrapper

	}// .n-enum-widget

</style>
