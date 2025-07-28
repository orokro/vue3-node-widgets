<!--
	Node.vue
	--------

	This will be one of the on screen nodes.

	If the node class specifies just values for its inputs and ouputs,
	this will automatically generate the UI and sockets for them.

	However, if the node specifies a custom component, then we'll mount
	that in this element as a container.

	This element will have a title bar that can drag the node around,
	and a close button to remove the node from the graph.
-->
<template>

	<!-- main outer wrapper -->
	<div class="node-box" :style="{
			left: `${node.x?.value}em`,
			top: `${node.y?.value}em`,
		}">

		<!-- title -->
		<div 
			class="title-bar"
			@mousedown.stop="startDrag"
		>
			<span>
				{{ node.constructor.nodeName }}
			</span>

			<!-- close button -->
			<div 
				class="delete-button"
				@click.stop.prevent="nwSystem.removeNode(node)"
			>
				<i class="material-icons">close</i>
			</div>
		</div>

		<!-- node content -->
		<div class="content">

			<!-- only render this if we don't provide a custom component -->
			<template v-if="node.constructor.customComponent==null">
				<span v-if="node.constructor.fields.length === 0">
					NODE CONTENT.
				</span>
				<div v-else>
					
					<div 
						class="node-field-row"
						v-for="(field, index) in node.constructor.fields"
					>
						<NLabel 
							v-if="field.fieldType == FIELD_TYPE.LABEL"
							:key="index"
							:text="field.text"
							:align="field.align"/>

						<template v-else-if="field.fieldType == FIELD_TYPE.INPUT">
							<div 
								class="field-name"
								:title="field.description"
							>
								<span>{{ field.title }}</span>
							</div>
							<component
								:is="field.valueType.nodeWidgetComponent"
								:key="index"
								:nwSystem="nwSystem"
								:node="node"
								:field="field"
							/>
						</template>

					</div>
				</div>
			</template>

		</div>
	</div>
</template>
<script setup>

function a(a){
	console.log('a', a);
	return a;
}	

// vue imports
import { ref } from 'vue';

// our app
import { FIELD_TYPE, NODE_TYPE } from '@/classes/NWNode';
// components
import NLabel from './TypeWidgets/NLabel.vue';

// props
const props = defineProps({

	// reference to the NWEditor instance
	nwSystem: {
		type: Object,
		required: true
	},

	// the node instance 
	node: {
		type: Object,
		required: true
	}
});


/**
 * Handles the start of dragging the node
 * 
 * @param e - The mouse event that triggered this function
 */
function startDrag(e) {

	// save our nodes initial position
	const initialX = props.node.x.value;
	const initialY = props.node.y.value;

	// get the zoom scale from the NWEditor instance
	const zoomScale = props.nwSystem.zoomScale.value;

	// get the drag helper instances from the NWEditor instance &  ste the drag helpers zoom scale
	const dh = props.nwSystem.dragHelper;

	dh.dragStart(

		(dx, dy) => {

			props.node.setPosition(
				initialX - dx / zoomScale,
				initialY - dy / zoomScale
			);
		},
		(dx, dy) => {

		},
	);

}

</script>
<style lang="scss" scoped>

	// the main box
	.node-box {

		// fixed absolute
		position: absolute;
		box-sizing: border-box;

		// minimum box size
		min-width: 200em;
		// min-height: 100em;

		// nice rounded border
		border-radius: 10em;
		border: 2em solid black;

		// padding on top for the title bar
		padding-top: 22em;

		// the title bar for the node that has the close button
		//  & can drag the node around
		.title-bar {

			// fixed position along the topo
			position: absolute;
			inset: 0em 0em auto 0em;
			height: 22em;
			box-sizing: border-box;

			// background color
			background: rgba(0, 0, 0, 0.5);

			// same rounded corners at the top
			border-top-left-radius: 7em;
			border-top-right-radius: 7em;

			// look draggable
			cursor: move;

			padding: 3em 20em 0em 7em;
			text-align: left;
			text-wrap: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;

			span {
				font-size: 12em;
				color: white;
				font-weight: bold;
			}

			// the delete button
			.delete-button {
				
				// red round circle
				background	: rgba(0, 0, 0, 0.55);
				border-radius: 50%;
				width: 16em;
				height: 16em;

				// light up on hover
				&:hover {
					background: rgba(255, 0, 0, 0.55);
				}

				// position the close button
				position: absolute;
				inset: 3em 4em 4em auto;

				// make it look like a button
				cursor: pointer;
				color: white;

				i {
					color: white;
					font-size: 14em;
					font-weight: bolder;;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				
				}// i

			}//.delete-button
			
		}// .title-bar

		// the content area of the node
		.content {

			// fill the rest of the box
			width: 100%;
			height: 100%;

			// padding for the content
			/* padding: 30em; */

			// background color
			background: rgba(255, 255, 255, 0.8);

			border-radius: 0em 0em 7em 7em;

			// the rows where we spawn the individual fields
			.node-field-row {

				padding: 0em 8em;

				background: rgba(0, 0, 0, 0.1);
				&:nth-child(odd) {
					background: rgba(0, 0, 0, 0.15);
				}

				.field-name {

					padding: 6em 6em 0em;

					span {
						padding: 0em;
						font-size: 11em;
						font-style: italic;
						opacity: 0.85;
					}

				}// .field-name

			}// .node-field-row

			span {
				display: block;
				padding: 2em;
				font-size: 16em;
				color: black;
			}

		}// .content

	}// .node-box

</style>
