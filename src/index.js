/*
	src/index.js
	------------

	Public API entry point — what `vue3-node-widgets` resolves to when imported.

	This is the single source of truth for the published library's surface area.
	Anything exported here is part of the consumer-facing contract; anything
	NOT exported here is internal and may change between versions.

	Pre-publish, the test harness imports from `'vue3-node-widgets'` via a
	vite alias that points here, so harness imports look identical to what
	consumers will write after `npm install vue3-node-widgets`.

	Intentionally NOT exported:
	  - NWEditor          (per-window view; internal — replaced by EditorState)
	  - NWGraph           (graph data structure; consumers reach data via
	                       editorState methods, never directly)
	  - ConnectionManager (internal wiring management)
	  - SelectionManager  (internal — surfaced via editorState.selection)
	  - VTypeRegistry     (internal — surfaced via editorState type registration)
	  - VCoalescer        (internal — surfaced via editorState.getModel coalesce metadata)
	  - Serializer        (legacy stub; serialize/deserialize live on editorState)
*/


// ─── Factory + state ─────────────────────────────────────────────────────────

export { createEditorState, EditorState } from './classes/EditorState.js';


// ─── Editor component ────────────────────────────────────────────────────────

export { default as NWEditorGraph } from './components/NWEditorGraph.vue';


// ─── Constants ───────────────────────────────────────────────────────────────

export { NODE_TYPE, FIELD_TYPE, SOCKET_TYPE } from './classes/NWNode.js';


// ─── Base classes (for consumer extension) ───────────────────────────────────
//
// Consumers extend NWNode to define their own node types, and extend VType
// to define their own value types. These are the only internal classes that
// are part of the public contract.

export { default as NWNode } from './classes/NWNode.js';
export { default as VType } from './classes/VType.js';


// ─── Built-in V-types ────────────────────────────────────────────────────────

export {
	VNumber,
	VAngle,
	VInteger,
	VVector2,
	VVector3,
	VAngles,
	VColor3,
	VColor4,
	VBoolean,
	VText,
	VCharacter,
	VEnum,
	VGraph,
	VGroupAny,
	VImage,
	VFile,

	// aggregate convenience export — pass to createEditorState({ types: defaultTypes })
	defaultTypes,
} from './classes/Types/index.js';


// ─── Built-in node list ──────────────────────────────────────────────────────

// aggregate convenience export — pass to createEditorState({ availableNodes: defaultNodeList })
export { defaultNodeList } from './classes/Nodes/index.js';
