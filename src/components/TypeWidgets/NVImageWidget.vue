<!--
	NVImageWidget.vue
	-----------------

	Widget for the VImage type.

	Shows:
	  - A thumbnail preview above the button when an image is loaded
	  - A "Choose Image" button (doubles as the filename label once loaded)
	  - A small × clear button when an image is loaded

	The raw field value shape is: { name: string|null, path: string|null, dataUrl: string|null }

	Reads from field.valueType:
	  serializeAs — 'path' | 'base64' (display-only; doesn't change widget behaviour)

	NOTE on em sizing:
	  This project uses em-based scaling (not CSS transforms).
	  - Use <div> not <button> — browser UA stylesheet resets font-size on <button>, breaking the cascade
	  - font-size lives on the text wrapper span; all layout em values are relative to the parent base em
-->
<template>

	<div
		class="n-image-widget"
		:class="{ 'read-only': readOnly }"
	>

		<!-- thumbnail — only visible when an image is loaded -->
		<div class="thumbnail-wrap" v-if="imageDataUrl">
			<img :src="imageDataUrl" class="thumbnail" alt="" />
		</div>

		<!-- button row -->
		<div class="button-row">

			<div
				class="pick-btn"
				:class="{ 'has-image': !!imageName }"
				@click="openPicker"
				:title="imageName || 'No image selected'"
			>
				<span>{{ imageName || 'Choose Image…' }}</span>
			</div>

			<div
				v-if="imageName && !readOnly"
				class="clear-btn"
				@click="clearImage"
				title="Clear image"
			><span>×</span></div>

		</div>

		<!-- hidden file input -->
		<input
			type="file"
			ref="fileInput"
			accept="image/*"
			style="display:none"
			@change="onFileChange"
		/>

	</div>

</template>
<script setup>

import { computed, ref } from 'vue';

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
		default: 'left'
	},

	readOnly: {
		type: Boolean,
		default: false
	},
});

const fieldState = props.node.fieldState[props.field.name];
const fileInput = ref(null);

// Read from valueRef (shallowRef) for reactivity
const imageDataUrl = computed(() => fieldState.valueRef.value?.dataUrl || null);
const imageName    = computed(() => fieldState.valueRef.value?.name    || null);


/** Open the native file picker */
function openPicker() {
	if (!props.readOnly) fileInput.value?.click();
}


/** Clear the selected image */
function clearImage() {
	fieldState.val = { name: null, path: null, dataUrl: null };
}


/** Handle file selection */
function onFileChange(e) {

	const file = e.target.files?.[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (evt) => {
		fieldState.val = {
			name:    file.name,
			path:    file.path   || null,
			dataUrl: evt.target.result,
		};
	};
	reader.readAsDataURL(file);

	// Reset so the same file can be re-selected if needed
	e.target.value = '';
}

</script>
<style lang="scss" scoped>

	.n-image-widget {

		// ---- thumbnail ----
		.thumbnail-wrap {

			width: 100%;
			margin-bottom: 4em;

			.thumbnail {
				display: block;
				width: 100%;
				max-height: 120em;
				object-fit: contain;
				border-radius: 6em;
				background: rgba(0,0,0,0.15);
			}
		}

		// ---- button row ----
		.button-row {

			display: flex;
			gap: 4em;
			align-items: center;

			// Main pick / label button
			// font-size goes here so all inner ems are relative to it
			.pick-btn {
				flex: 1;
				min-width: 0;
				font-size: 12em;

				background: var(--nw-node-input-b-g-color);
				color: var(--nw-node-input-text-color);
				border-radius: 0.8em;
				padding: 0.25em 0.5em;
				cursor: pointer;

				// text inside inherits font-size from parent, stays at 12em scale
				span {
					display: block;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					opacity: 0.7;
				}

				&.has-image span {
					opacity: 1.0;
				}

				&:hover {
					background: var(--nw-node-input-accent1);
				}
			}

			// Small × clear button
			// font-size here too so the × glyph and circle size are in sync
			.clear-btn {
				flex: 0 0 auto;
				font-size: 12em;

				width: 1.4em;
				height: 1.4em;

				background: var(--nw-node-input-b-g-color);
				color: var(--nw-node-input-text-color);
				border-radius: 50%;
				cursor: pointer;

				display: flex;
				align-items: center;
				justify-content: center;

				span {
					line-height: 1;
				}

				&:hover {
					background: var(--nw-node-input-accent1);
				}
			}
		}

		// ---- read-only state ----
		&.read-only {
			.pick-btn, .clear-btn {
				cursor: not-allowed;
				opacity: 0.5;
				pointer-events: none;
			}
		}

	} // .n-image-widget

</style>
