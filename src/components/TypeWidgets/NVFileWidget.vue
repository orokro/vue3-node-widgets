<!--
	NVFileWidget.vue
	----------------

	Widget for the VFile type.

	Shows:
	  - A scrollable file list (max height constrained) with a × remove button per file
	  - A "Choose File…" / "Add File…" button below the list

	The raw field value is an Array of: { name: string|null, path: string|null, data: string|null }

	Reads from field.valueType:
	  multiple    — bool: whether the picker allows multi-select & appending
	  accept      — string: file input accept attribute (e.g. '.pdf,.docx', 'image/*', '*')
	  serializeAs — 'path' | 'binary': if 'binary', reads file data at pick time as base64

	NOTE on em sizing:
	  This project uses em-based scaling (not CSS transforms).
	  - Use <div> not <button> — browser UA stylesheet resets font-size on <button>, breaking the cascade
	  - font-size lives on the text wrapper span (or on the row container for layout reference);
	    all layout em values are relative to the parent base em
-->
<template>

	<div
		class="n-file-widget"
		:class="{ 'read-only': readOnly }"
	>

		<!-- file list (only rendered when there are files) -->
		<div class="file-list" v-if="files.length > 0">
			<div
				class="file-item"
				v-for="(file, index) in files"
				:key="index"
			>
				<span class="file-name" :title="file.path || file.name">{{ file.name }}</span>
				<div
					v-if="!readOnly"
					class="remove-btn"
					@click="removeFile(index)"
					title="Remove file"
				><span>×</span></div>
			</div>
		</div>

		<!-- pick button -->
		<div
			class="pick-btn"
			@click="openPicker"
		>
			<span>{{ files.length > 0 && isMultiple ? 'Add File…' : 'Choose File…' }}</span>
		</div>

		<!-- hidden file input -->
		<input
			type="file"
			ref="fileInput"
			:accept="acceptFilter"
			:multiple="isMultiple"
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

const fieldState  = props.node.fieldState[props.field.name];
const fileInput   = ref(null);

// Read params from the type class (possibly a parameterized subclass)
const isMultiple   = computed(() => props.field.valueType.multiple    ?? false);
const acceptFilter = computed(() => props.field.valueType.accept      ?? '*');
const serializeAs  = computed(() => props.field.valueType.serializeAs ?? 'path');

// Current file list — read from valueRef (shallowRef) for reactivity
const files = computed(() => fieldState.valueRef.value || []);


/** Open the native file picker */
function openPicker() {
	if (!props.readOnly) fileInput.value?.click();
}


/** Remove a file from the list by index */
function removeFile(index) {
	const current = files.value;
	fieldState.val = current.filter((_, i) => i !== index);
}


/** Read a File object as a base64 data URL */
function readFileAsBase64(file) {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload  = (e) => resolve(e.target.result);
		reader.onerror = ()  => resolve(null);
		reader.readAsDataURL(file);
	});
}


/** Handle file selection from the picker */
async function onFileChange(e) {

	const selectedFiles = Array.from(e.target.files || []);
	if (!selectedFiles.length) return;

	const newFiles = await Promise.all(selectedFiles.map(async (f) => {
		let data = null;
		if (serializeAs.value === 'binary') {
			data = await readFileAsBase64(f);
		}
		return {
			name: f.name,
			path: f.path || null,
			data,
		};
	}));

	if (isMultiple.value) {
		fieldState.val = [...files.value, ...newFiles];
	} else {
		fieldState.val = [newFiles[0]];
	}

	e.target.value = '';
}

</script>
<style lang="scss" scoped>

	.n-file-widget {

		display: flex;
		flex-direction: column;
		gap: 3em;

		// ---- file list ----
		.file-list {

			max-height: 90em;
			overflow-y: auto;
			overflow-x: hidden;

			display: flex;
			flex-direction: column;
			gap: 2em;

			scrollbar-width: thin;
			scrollbar-color: var(--nw-node-input-separator-color) transparent;

			// Each row: font-size sets the em scale for the whole row
			.file-item {
				font-size: 12em;

				display: flex;
				align-items: center;
				gap: 0.33em;

				background: var(--nw-node-input-b-g-color);
				border-radius: 0.5em;
				padding: 0.17em 0.33em 0.17em 0.5em;

				// filename text — inherits 12em from .file-item
				.file-name {
					flex: 1;
					min-width: 0;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					color: var(--nw-node-input-text-color);
				}

				// × remove button — sized relative to the 12em row scale
				.remove-btn {
					flex: 0 0 auto;
					width: 1.1em;
					height: 1.1em;

					background: transparent;
					color: var(--nw-node-input-text-color);
					border-radius: 50%;
					cursor: pointer;
					opacity: 0.5;

					display: flex;
					align-items: center;
					justify-content: center;

					span {
						line-height: 1;
					}

					&:hover {
						opacity: 1.0;
						background: var(--nw-node-input-accent1);
					}
				}

			}// .file-item

		}// .file-list

		// Pick button — font-size sets the em scale, inner span is the text
		.pick-btn {
			font-size: 12em;

			background: var(--nw-node-input-b-g-color);
			color: var(--nw-node-input-text-color);
			border-radius: 0.8em;
			padding: 0.25em 0.5em;
			text-align: center;
			cursor: pointer;
			opacity: 0.7;

			span {
				// inherits font-size from .pick-btn — no extra multiplier
			}

			&:hover {
				background: var(--nw-node-input-accent1);
				opacity: 1.0;
			}
		}

		// ---- read-only state ----
		&.read-only {
			.pick-btn, .remove-btn {
				cursor: not-allowed;
				pointer-events: none;
				opacity: 0.3;
			}
		}

	} // .n-file-widget

</style>
