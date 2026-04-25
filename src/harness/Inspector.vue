<!--
	Inspector.vue
	-------------

	Reference inspector that demonstrates editorState.getNodeInfo() +
	editorState.getFieldBinding() usage. Shows whichever node is in
	the active graph's selection (last-touched-wins). When 0 or many
	are selected, just shows a status message.

	The point of this component is to exercise the consumer-facing API
	without reaching into NWNode.fieldState — bindings.setValue is the
	single signaling path that flows through wrapFieldValue's watch and
	bumps editorState.changeVersion exactly once per edit.
-->
<template>
	<div class="inspector-root">

		<header class="hdr">Inspector</header>

		<!-- Empty / multi-select states -->
		<div v-if="!selected" class="empty">
			<p v-if="state.selectionCount.value === 0">Nothing selected.</p>
			<p v-else>{{ state.selectionCount.value }} nodes selected (multi-select inspection not implemented).</p>
		</div>

		<!-- Single-node info + editable fields -->
		<div v-else class="node-block">

			<div class="node-hdr">
				<strong>{{ info.title }}</strong>
				<small class="muted">{{ info.kind }}</small>
			</div>
			<div class="node-meta">
				<small>id: <code>{{ info.id }}</code></small><br>
				<small>type: <code>{{ info.type }}</code></small>
			</div>

			<div class="fields">
				<div v-for="field in info.fields" :key="field.name" class="field">

					<div class="field-hdr">
						<span class="field-title">{{ field.title }}</span>
						<small class="muted">{{ field.kind }} · {{ field.type }}</small>
					</div>

					<!-- editable widget for inputs and props -->
					<div v-if="field.kind !== 'output'" class="field-control">

						<!-- numeric types -->
						<input
							v-if="isNumericType(field.type)"
							type="number"
							:value="readValue(field.name)"
							@input="e => write(field.name, parseFloat(e.target.value))"
						/>

						<!-- text-ish types -->
						<input
							v-else-if="field.type === 'Text' || field.type === 'Character'"
							type="text"
							:value="readValue(field.name) ?? ''"
							@input="e => write(field.name, e.target.value)"
						/>

						<!-- boolean -->
						<input
							v-else-if="field.type === 'Boolean'"
							type="checkbox"
							:checked="!!readValue(field.name)"
							@change="e => write(field.name, e.target.checked)"
						/>

						<!-- compound / unknown — display only -->
						<code v-else class="value-display">{{ formatValue(readValue(field.name)) }}</code>

					</div>

					<!-- read-only display for outputs -->
					<div v-else class="field-control">
						<code class="value-display">{{ formatValue(readValue(field.name)) }}</code>
					</div>

					<!-- wired indicator (input fields only) -->
					<div v-if="field.kind === 'input'" class="wired-flag" :class="{ on: isWired(field.name) }">
						{{ isWired(field.name) ? 'wired' : 'unwired' }}
					</div>

				</div>
			</div>
		</div>

	</div>
</template>

<script setup>

import { computed } from 'vue';

const props = defineProps({
	state: { type: Object, required: true },
});


// ─── Reactive selection → single node (or null for 0 / multi) ────────────────

const selected = computed(() => {
	const sel = props.state.selection.value;
	return sel.length === 1 ? sel[0] : null;
});


// info is a reactive shape from getNodeInfo
const info = computed(() => {
	return selected.value ? props.state.getNodeInfo(selected.value) : null;
});


// bindings map: { fieldName: { value, setValue, valueRef, wired, ... }, ... }
// Recomputed whenever the selected node changes (info gives us the field list).
const bindings = computed(() => {
	if (!selected.value || !info.value) return {};
	const map = {};
	for (const f of info.value.fields) {
		map[f.name] = props.state.getFieldBinding(selected.value, f.name);
	}
	return map;
});


// ─── Field IO helpers ────────────────────────────────────────────────────────

function readValue(name) {
	const b = bindings.value[name];
	return b ? b.value.value : undefined;
}

function write(name, val) {
	const b = bindings.value[name];
	if (b) b.setValue(val);
}

function isWired(name) {
	const b = bindings.value[name];
	return !!(b?.wired?.value);
}

function isNumericType(t) {
	return t === 'Number' || t === 'Integer' || t === 'Angle';
}

function formatValue(v) {
	if (v == null) return String(v);
	if (typeof v === 'object') {
		try { return JSON.stringify(v); } catch (_) { return '[object]'; }
	}
	return String(v);
}

</script>

<style scoped>

	.inspector-root {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 13px;
		color: #ddd;
		padding: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.hdr {
		padding: 8px 12px;
		background: #1f1f1f;
		border-bottom: 1px solid #333;
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #999;
	}

	.empty {
		padding: 20px 12px;
		color: #777;
		font-style: italic;
	}

	.node-block {
		padding: 12px;
		overflow: auto;
	}

	.node-hdr {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 4px;
	}
	.node-hdr strong { color: #6cf; font-size: 14px; }
	.node-hdr .muted { color: #666; font-size: 11px; }

	.node-meta {
		margin-bottom: 14px;
		color: #888;
		line-height: 1.5;
	}
	.node-meta code { color: #aaa; font-size: 11px; }

	.fields {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.field {
		background: #1a1a1a;
		border: 1px solid #2a2a2a;
		border-radius: 4px;
		padding: 8px 10px;
	}

	.field-hdr {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-bottom: 6px;
	}
	.field-title { color: #ccc; font-weight: 500; }
	.muted { color: #666; font-size: 11px; }

	.field-control input[type=number],
	.field-control input[type=text] {
		width: 100%;
		background: #0e0e0e;
		border: 1px solid #333;
		color: #ddd;
		padding: 4px 6px;
		font-family: inherit;
		font-size: 12px;
		box-sizing: border-box;
	}

	.field-control input[type=checkbox] {
		transform: scale(1.2);
	}

	.value-display {
		display: block;
		background: #0e0e0e;
		padding: 4px 6px;
		border: 1px solid #333;
		font-family: monospace;
		font-size: 11px;
		color: #6cf;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.wired-flag {
		margin-top: 4px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #555;
	}
	.wired-flag.on { color: #4c4; }

</style>
