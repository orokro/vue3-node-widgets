<!--
	HarnessApp.vue
	--------------

	Reference integration of vue3-node-widgets. Imports come from the package
	name (via vite alias pre-publish) so this file reads exactly like a real
	consumer integration.

	Layout:

		┌─────────────────────────────────────────────────────────────────┐
		│ Toolbar:  [Seed] [Get Model] [Evaluate] [Roundtrip]      v: N   │
		├──────────────────────────┬──────────────────────────┬───────────┤
		│                          │                          │           │
		│  <NWEditorGraph A>       │  <NWEditorGraph B>       │ Inspector │
		│  (window 1)              │  (window 2)              │           │
		│                          │                          │           │
		├──────────────────────────┴──────────────────────────┴───────────┤
		│ Status:  active=… path=… selectionCount=…                       │
		└─────────────────────────────────────────────────────────────────┘

	Both NWEditorGraph instances point at the same EditorState — they share
	graph data, but each has its own pan/zoom and breadcrumb position.
	The inspector reads from editorState.selection (last-touched-wins).
-->
<template>
	<div class="harness-root">

		<!-- Toolbar -->
		<header class="toolbar">
			<strong class="brand">vue3-node-widgets harness</strong>
			<span class="sep"></span>

			<button @click="seedDemoGraph">Seed Demo</button>
			<button @click="dumpModel">Get Model → console</button>
			<button @click="runEvaluate">Evaluate → console</button>
			<button @click="roundtrip">Serialize → Deserialize</button>
			<button @click="clearGraph">Clear</button>

			<span class="spacer"></span>

			<span class="meta">changeVersion: <code>{{ editorState.changeVersion.value }}</code></span>
		</header>

		<!-- Main row: two graph views + inspector -->
		<main class="main-row">

			<!-- Window A -->
			<section class="pane">
				<div class="pane-label">Window A</div>
				<div class="graph-host">
					<NWEditorGraph :state="editorState" />
				</div>
			</section>

			<!-- Window B -->
			<section class="pane">
				<div class="pane-label">Window B</div>
				<div class="graph-host">
					<NWEditorGraph :state="editorState" />
				</div>
			</section>

			<!-- Inspector -->
			<aside class="inspector">
				<Inspector :state="editorState" />
			</aside>

		</main>

		<!-- Status bar -->
		<footer class="status">
			<span>active graph: <code>{{ activeGraphName }}</code></span>
			<span>path: <code>{{ pathString }}</code></span>
			<span>selection: <code>{{ editorState.selectionCount.value }}</code></span>
		</footer>

	</div>
</template>

<script setup>

// vue
import { computed } from 'vue';

// IMPORTS COME FROM THE PACKAGE NAME — these are exactly what a real consumer
// will write after `npm install vue3-node-widgets`. Pre-publish, vite resolves
// 'vue3-node-widgets' to ./src/index.js via an alias in vite.config.js.
import {
	createEditorState,
	NWEditorGraph,
	defaultTypes,
	defaultNodeList,
} from 'vue3-node-widgets';

// Local harness-only components (NOT part of the library)
import Inspector from './Inspector.vue';

// ─── Build the shared EditorState ────────────────────────────────────────────
//
// Default-off: createEditorState() with no args produces an empty editor.
// We opt into the full built-in set via the aggregate exports — same one-liner
// pattern the library README documents for the shader-graph case.

const editorState = createEditorState({
	types: defaultTypes,
	availableNodes: defaultNodeList,
});

// expose to the browser console for debugging
window.editorState = editorState;


// ─── Status bar values ───────────────────────────────────────────────────────

const activeGraphName = computed(() => {
	const g = editorState.activeGraph.value;
	return g?.name?.value || 'Root Graph';
});

const pathString = computed(() => {
	const path = editorState.activeGraphPath.value;
	return path.length ? path.join(' / ') : '(none)';
});


// ─── Toolbar actions ─────────────────────────────────────────────────────────

/**
 * Seed a small demo graph that exercises a multi-hop coalescer:
 *   InputCartesianCoords (VVector2) → OutputColor (VColor3)
 * Coalescer path: VVector2 → VVector3 → VColor3.
 *
 * After seeding, click Get Model in the toolbar; the wire's `coalesce.hops`
 * should be ['VVector2', 'VVector3', 'VColor3'].
 */
function seedDemoGraph() {

	const root = editorState.rootGraph;

	// look up node classes by serialize-key from the available-nodes list
	const findClass = (key) => {
		const entry = editorState.availableNodes.value.find(
			n => (n.key || n.class?.name) === key
		);
		return entry?.class || null;
	};

	const CartCls = findClass('InputCartesianCoordsNode');
	const OutCls  = findClass('OutputColorNode');
	if (!CartCls || !OutCls) {
		console.warn('seedDemoGraph: could not find required node classes — skipping seed');
		return;
	}

	const cart = root.addNode(CartCls, 80, 200);
	const out  = root.addNode(OutCls, 520, 200);

	// wire Pixel X,Y as Vector2 → Output Color (multi-hop coalesce VVector2 → VVector3 → VColor3)
	const cartOutField = cart.fieldsList.value.find(f => f.name === 'posV2')
		|| cart.fieldsList.value.find(f => f.fieldType === 'output');
	const outInField = out.fieldsList.value.find(f => f.name === 'outColor')
		|| out.fieldsList.value.find(f => f.fieldType === 'input');

	if (cartOutField && outInField) {
		// NOTE the counter-intuitive Connection naming: "input" side of the wire
		// attaches to the source node's OUTPUT socket; "output" side attaches to
		// the destination node's INPUT socket.
		const wire = root.connMgr.addConnectionBasic();
		wire.setInput(cart, cartOutField);    // PRODUCER side
		wire.setOutput(out, outInField);      // CONSUMER side
	}
}


/**
 * Dumps the JSON AST to the console — what shader codegen sees.
 */
function dumpModel() {
	const model = editorState.getModel();
	console.group('editorState.getModel()');
	console.log(JSON.stringify(model, null, 2));
	console.groupEnd();
}


/**
 * Single-shot evaluate at current state.
 */
function runEvaluate() {
	const result = editorState.evaluate({});
	console.group('editorState.evaluate({})');
	console.log(result);
	console.groupEnd();
}


/**
 * Smoke-test the serialize/deserialize round-trip.
 * Saves current state, replaces with empty, then restores.
 */
function roundtrip() {
	const saved = editorState.serialize();
	console.log('serialized:', saved);

	editorState.deserialize({ name: 'Empty', subGraph: false, nodes: [], wires: [] });
	console.log('cleared. now restoring…');

	// short delay so the UI briefly shows the empty state, then restore
	setTimeout(() => editorState.deserialize(saved), 250);
}


/**
 * Replace state with an empty graph.
 */
function clearGraph() {
	editorState.deserialize({ name: 'Root Graph', subGraph: false, nodes: [], wires: [] });
}

</script>

<style scoped>

	.harness-root {
		display: flex;
		flex-direction: column;
		position: fixed;
		inset: 0;
		font-family: system-ui, -apple-system, sans-serif;
		background: #141414;
		color: #ddd;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: #1f1f1f;
		border-bottom: 1px solid #333;
		font-size: 13px;
		flex: 0 0 auto;
	}

	.toolbar .brand {
		color: #6cf;
		letter-spacing: 0.02em;
	}

	.toolbar .sep {
		width: 1px;
		height: 20px;
		background: #444;
		margin: 0 6px;
	}

	.toolbar .spacer { flex: 1; }

	.toolbar .meta { color: #999; font-size: 12px; }
	.toolbar .meta code { color: #6cf; }

	.toolbar button {
		background: #2a2a2a;
		border: 1px solid #444;
		color: #ddd;
		padding: 5px 10px;
		font-size: 12px;
		border-radius: 4px;
		cursor: pointer;
		font-family: inherit;
	}
	.toolbar button:hover { background: #3a3a3a; }
	.toolbar button:active { background: #1a1a1a; }

	.main-row {
		flex: 1 1 auto;
		display: flex;
		min-height: 0;
	}

	.pane {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		min-width: 0;
		border-right: 1px solid #333;
	}

	.pane-label {
		flex: 0 0 auto;
		padding: 4px 10px;
		background: #181818;
		border-bottom: 1px solid #2a2a2a;
		font-size: 11px;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.graph-host {
		flex: 1 1 auto;
		min-height: 0;
		position: relative;
	}

	.inspector {
		flex: 0 0 320px;
		min-width: 0;
		overflow: auto;
		background: #181818;
	}

	.status {
		flex: 0 0 auto;
		display: flex;
		gap: 24px;
		padding: 6px 12px;
		background: #1a1a1a;
		border-top: 1px solid #333;
		font-size: 12px;
		color: #888;
	}
	.status code { color: #6cf; }

</style>
