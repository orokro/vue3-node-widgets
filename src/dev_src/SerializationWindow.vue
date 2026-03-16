<!--
	SerializationWindow.vue
	-----------------------

	A dev window for testing serialization and deserialization of node graphs.
-->
<template>
	<div class="serialization-window">
		<div class="toolbar">
			<button @click="handleSerialize">Serialize Current Graph</button>
			<button @click="handleDeserialize">Deserialize to New Graph</button>
			<button @click="handleClear">Clear</button>
		</div>
		<textarea 
			v-model="jsonText" 
			placeholder="Serialized JSON will appear here..."
			spellcheck="false"
		></textarea>
		<div v-if="error" class="error-msg">
			{{ error }}
		</div>
	</div>
</template>

<script setup>
import { ref, inject } from 'vue';

const app = inject('app');
const jsonText = ref('');
const error = ref('');

function handleSerialize() {
	error.value = '';
	try {
		const graph = app.currentGraph.value;
		if (!graph) {
			error.value = 'No current graph selected';
			return;
		}
		
		// We expect graph to have a serialize method
		if (typeof graph.serialize !== 'function') {
			error.value = 'Graph does not implement serialize()';
			return;
		}

		const data = graph.serialize();
		jsonText.value = JSON.stringify(data, null, 2);
	} catch (e) {
		error.value = 'Serialization failed: ' + e.message;
		console.error(e);
	}
}

async function handleDeserialize() {
	error.value = '';
	try {
		if (!jsonText.value.trim()) {
			error.value = 'JSON text is empty';
			return;
		}

		const data = JSON.parse(jsonText.value);
		
		// Load NWGraph dynamically
		const { NWGraph } = await import('@/classes/NWGraph');
		
		// Create a new graph with the same type registry
		const newGraph = new NWGraph(app.typeRegistry);
		
		// Deserialize the data into the new graph
		if (typeof newGraph.deserialize !== 'function') {
			error.value = 'NWGraph does not implement deserialize()';
			return;
		}

		newGraph.deserialize(data);
		
		// Add and select the new graph in the app
		app.addGraph(newGraph);
		app.selectGraph(newGraph);
		
	} catch (e) {
		error.value = 'Deserialization failed: ' + e.message;
		console.error(e);
	}
}

function handleClear() {
	jsonText.value = '';
	error.value = '';
}
</script>

<style lang="scss" scoped>
.serialization-window {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	background: #222;
	color: #eee;
	padding: 10px;
	box-sizing: border-box;

	.toolbar {
		display: flex;
		gap: 10px;
		margin-bottom: 10px;

		button {
			padding: 5px 10px;
			cursor: pointer;
			background: #444;
			color: white;
			border: 1px solid #666;
			border-radius: 4px;
			&:hover {
				background: #555;
			}
		}
	}

	textarea {
		flex: 1;
		background: #111;
		color: #0f0;
		font-family: monospace;
		padding: 10px;
		border: 1px solid #444;
		border-radius: 4px;
		resize: none;
		outline: none;
	}

	.error-msg {
		margin-top: 10px;
		color: #f55;
		font-size: 12px;
		background: rgba(255, 0, 0, 0.1);
		padding: 5px;
		border-radius: 4px;
	}
}
</style>
