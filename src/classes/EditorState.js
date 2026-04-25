/*
	EditorState.js
	--------------

	The shared, top-level state object for a node-widget editor.

	Created via createEditorState({...}). This is the public contract
	for consumers of the library — they should never need to touch
	NWGraph, ConnectionManager, SelectionManager, VTypeRegistry,
	or any other internal directly.

	Multiple <NWEditorGraph> components can be mounted against the same
	EditorState to provide multiple synchronized views of the same graph
	data. Each view keeps its own pan/zoom and breadcrumb position;
	graph data and selection state are shared via this object.

	Default-off: createEditorState({}) with no args produces an empty
	editor — no types, no coalescers, no available nodes. Consumers
	import what they want. For the shader-graph case, the library ships
	`defaultTypes` and `defaultNodeList` as aggregate convenience exports.
*/

// vue
import { ref, shallowRef, computed } from 'vue';

// our app
import { VTypeRegistry } from './VTypeRegistry';
import { NWGraph } from './NWGraph';
import VCoalescer from './VCoalescer';
import { NODE_TYPE, FIELD_TYPE } from './NWNode';

// external libs/misc
import t from 'typical';


// main export class
export class EditorState {

	/**
	 * Constructor — prefer using the createEditorState() factory below.
	 *
	 * @param {Object} options
	 * @param {Function[]} [options.types] - VType classes to register. NOT auto-loaded; consumer must opt in.
	 * @param {Object[]} [options.coalescers] - Additional cross-type conversions, additive on top of per-type ones.
	 *                                          Shape: [{from: VTypeClass, to: VTypeClass, fn: (val) => val}, ...]
	 * @param {Array} [options.availableNodes] - Node classes or {class, menuPath, key} objects for the add-node menu.
	 * @param {Object} [options.initialData] - Optional initial state (same shape as serialize() output).
	 */
	constructor({types = [], coalescers = [], availableNodes = [], initialData = null} = {}) {

		// unique id
		this.id = EditorState.generateUUID('state');

		// 1. Build the type registry from caller-provided types.
		//    No auto-defaults — consumer brings their own.
		this.typeRegistry = new VTypeRegistry(types);

		// 2. Apply additional factory-supplied coalescers ON TOP of per-type ones.
		this._applyExtraCoalescers(coalescers);

		// 3. Root graph — the literal top-of-tree graph. Per-window navigation
		//    (drilling into sub-graphs) lives on NWEditorView, not here.
		this._rootGraphRef = shallowRef(new NWGraph(this.typeRegistry));

		// 4. Available node list — consumer-driven, no auto-loaded defaults.
		this.availableNodes = shallowRef([]);
		if (Array.isArray(availableNodes) && availableNodes.length > 0) {
			this.addAvailableNodes(availableNodes);
		}

		// 5. Active SelMgr — last-touched-wins. Starts at root graph's selMgr.
		this._activeSelMgr = shallowRef(this.rootGraph.selMgr);

		// 6. Change version — bumps on any structural or value change.
		//    Consumers watch this to know when to re-call getModel() / getComputeFn().
		this.changeVersion = ref(0);

		// 6b. Deserialize version — bumps each time deserialize() runs. Per-window
		//     NWEditor instances watch this and reset their navigation (breadcrumbs
		//     + current view) back to the root graph, since their parentGraphs
		//     stack is referencing sub-graphs from the pre-deserialize data and
		//     would be semantically stale after a state replacement.
		this.deserializeVersion = ref(0);

		// 7. Bind callbacks ONCE so we can compare references during lazy re-attach.
		this._onChangeBound = () => this._handleGraphChange();
		this._onSelChangeBound = (sm) => this._promoteActiveSelMgr(sm);

		// 8. Reactive computeds that read from the active SelMgr (last-touched-wins).
		//    Consumers access these via `.value` like any Vue ref.
		this.selection = computed(() => {
			return this._activeSelMgr.value?.selectedNodes?.value || [];
		});

		this.selectionCount = computed(() => {
			return (this._activeSelMgr.value?.selectedNodes?.value || []).length;
		});

		this.activeGraph = computed(() => {
			return this._activeSelMgr.value?.graph || this.rootGraph;
		});

		this.activeGraphPath = computed(() => {
			return this._buildGraphPath(this.activeGraph.value);
		});

		// 9. Wire change-notification onto the root graph and any pre-existing
		//    sub-graphs reachable through GroupNodes. Subsequent sub-graphs added
		//    at runtime get attached lazily by _handleGraphChange below.
		this._attachToGraph(this.rootGraph);

		// 10. Initial data hydration (replaces root graph if provided).
		if (initialData) {
			this.deserialize(initialData);
		}
	}


	/**
	 * The root graph (top of the tree). Reactive via _rootGraphRef.
	 */
	get rootGraph() {
		return this._rootGraphRef.value;
	}
	set rootGraph(newGraph) {
		this._rootGraphRef.value = newGraph;
	}


	/**
	 * Expose the underlying shallowRef for components that need to bind reactively.
	 */
	get rootGraphRef() {
		return this._rootGraphRef;
	}


	/**
	 * Adds one or more available nodes to the editor's add-node menu.
	 *
	 * @param {Function|Object|Array} nodesList - Node class, {class, menuPath, key}, or array of either.
	 */
	addAvailableNodes(nodesList) {
		if (!Array.isArray(nodesList)) nodesList = [nodesList];
		for (const nodeDetails of nodesList) {
			this._addAvailableNode(nodeDetails);
		}
	}


	/**
	 * Internal helper to add a single available node entry.
	 */
	_addAvailableNode(nodeDetails) {
		let entry = nodeDetails;
		if (t.isClass(nodeDetails)) {
			entry = { class: nodeDetails, menuPath: '/' };
		}
		this.availableNodes.value = [...this.availableNodes.value, entry];
	}


	/**
	 * Applies additional coalescers from the factory args, on top of any
	 * already registered via per-type static fromCoalescers/toCoalescers.
	 *
	 * @param {Object[]} coalescers - [{from, to, fn}, ...]
	 */
	_applyExtraCoalescers(coalescers) {
		if (!Array.isArray(coalescers)) return;
		for (const entry of coalescers) {
			if (!entry || !entry.from || !entry.to || typeof entry.fn !== 'function') continue;
			this.typeRegistry._setCoalescer(
				entry.from,
				entry.to,
				new VCoalescer(entry.fn, {
					firstOrder: true,
					origin: [entry.from],
					hops: [entry.from, entry.to],
				})
			);
		}
	}


	/**
	 * Bumps the change version. Internal helper — called by structural
	 * mutations and by NWNode.requestComputeUpdate via the onChange callback.
	 */
	_bumpVersion() {
		this.changeVersion.value++;
	}


	/**
	 * Single onChange handler installed on every reachable graph. Bumps the
	 * version and lazily re-attaches to any newly-discovered sub-graphs.
	 *
	 * The lazy re-attach pattern handles the case where the user adds a new
	 * GroupNode at runtime — that GroupNode's sub-graph wasn't reachable when
	 * we initially walked the tree, but it becomes reachable as part of the
	 * change that just signaled. Re-walking is idempotent (we no-op if the
	 * onChange is already wired) so the cost is just an O(N) visit per change.
	 */
	_handleGraphChange() {
		this._bumpVersion();
		this._attachToGraph(this.rootGraph);
	}


	/**
	 * Recursively walks a graph and any nested sub-graphs (via GroupNodes),
	 * wiring both the onChange (structural/value-change signal) and the
	 * SelMgr.onChange (last-touched-wins promotion) handlers. Idempotent
	 * via reference checks — safe to call repeatedly.
	 *
	 * @param {NWGraph} graph
	 */
	_attachToGraph(graph) {
		if (!graph) return;

		// graph-level change signal (idempotent)
		if (graph.onChange !== this._onChangeBound) {
			graph.onChange = this._onChangeBound;
		}

		// per-graph selection-change signal (idempotent) — drives last-touched-wins
		if (graph.selMgr && graph.selMgr.onChange !== this._onSelChangeBound) {
			graph.selMgr.onChange = this._onSelChangeBound;
		}

		// recurse into any GroupNode sub-graphs
		const nodes = graph.nodes?.value || [];
		for (const node of nodes) {
			if (node?.constructor?.nodeType === NODE_TYPE.GROUP) {
				const sub = node.fieldState?.graph?.val;
				if (sub instanceof NWGraph) {
					this._attachToGraph(sub);
				}
			}
		}
	}


	/**
	 * Walk a graph's ancestry via ownerNode back-pointers, returning an array of
	 * graph names from root to the given graph (inclusive). Used by the
	 * activeGraphPath computed; also useful for breadcrumb-style UI.
	 *
	 * @param {NWGraph} graph
	 * @returns {String[]}
	 */
	_buildGraphPath(graph) {
		const path = [];
		const visited = new Set();
		let g = graph;
		while (g && !visited.has(g)) {
			visited.add(g);
			const isRoot = !g.ownerNode;
			const name = g.name?.value || (isRoot ? 'Root Graph' : 'Group');
			path.unshift(name);
			g = g.ownerNode?.graph || null;
		}
		return path;
	}


	/**
	 * Promotes a graph's SelMgr to be the active one (last-touched-wins).
	 * Internal — called by SelMgr notify-callback.
	 *
	 * @param {SelectionManager} selMgr
	 */
	_promoteActiveSelMgr(selMgr) {
		if (!selMgr) return;
		this._activeSelMgr.value = selMgr;
		this._bumpVersion();
	}


	/**
	 * Serialize the entire editor state (root graph + all sub-graphs).
	 * Does NOT capture viewing position (which sub-graph any window is in,
	 * pan/zoom, selection) — that's UI ephemera owned by NWEditorView.
	 *
	 * @returns {Object} JSON-safe object suitable for storage / transmission.
	 */
	serialize() {
		return this.rootGraph.serialize();
	}


	/**
	 * Replace state from serialized data. Resets to root and clears selection
	 * across all attached <NWEditorGraph> windows.
	 *
	 * IMPLEMENTATION NOTE: we deliberately mutate the existing rootGraph in
	 * place rather than swapping in a freshly-constructed one. The reason:
	 * per-window NWEditor instances hold direct references to the rootGraph
	 * (in their `rootGraph` field and parentGraphs breadcrumb stack). If we
	 * replace the instance, those windows are left pointing at an orphaned
	 * NWGraph — newly-added nodes go to the orphan, while serialize()/getModel()
	 * read from the fresh root. NWGraph.deserialize already clears+rebuilds in
	 * place, so reusing the instance keeps every window's references valid.
	 *
	 * Window navigation (breadcrumbs + current view) IS still reset by bumping
	 * `deserializeVersion`, which NWEditor instances watch in shared-state mode.
	 *
	 * @param {Object} data - Same shape as serialize() output.
	 */
	deserialize(data) {

		// Mutate in place — NWGraph.deserialize clears+rebuilds nodes/wires
		// without replacing the NWGraph instance itself.
		this.rootGraph.deserialize(data);

		// Active SelMgr stays the same instance (same graph), but the selection
		// it holds may reference now-removed nodes. Clear it.
		this.rootGraph.selMgr.selectNone();
		this._activeSelMgr.value = this.rootGraph.selMgr;

		// Re-attach onChange to capture any new sub-graphs reachable through
		// freshly-instantiated GroupNodes (idempotent for the root itself).
		this._attachToGraph(this.rootGraph);

		// Signal per-window NWEditors to reset their navigation stacks.
		this.deserializeVersion.value++;

		this._bumpVersion();
		return this;
	}


	// #region Selection
	// -----------------

	/**
	 * Replace the current selection with the given nodes. All nodes must
	 * belong to a single graph (selection is always single-graph). Promotes
	 * that graph's SelMgr to active (last-touched-wins).
	 *
	 * Pass an empty array (or call clearSelection) to clear.
	 *
	 * @param {NWNode|NWNode[]} nodes
	 * @throws {Error} if nodes from multiple graphs are passed.
	 */
	setSelection(nodes) {

		const arr = Array.isArray(nodes) ? nodes : (nodes ? [nodes] : []);

		if (arr.length === 0) {
			this.clearSelection();
			return;
		}

		// All nodes must belong to a single graph
		const graph = arr[0]?.graph || null;
		if (!graph || !graph.selMgr) {
			throw new Error('EditorState.setSelection: nodes have no graph reference');
		}
		for (const n of arr) {
			if (!n || n.graph !== graph) {
				throw new Error('EditorState.setSelection: all nodes must belong to a single graph');
			}
		}

		// SelMgr.setSelected fires onChange, which routes to _promoteActiveSelMgr
		graph.selMgr.setSelected(arr);
	}


	/**
	 * Clear the active graph's selection. The active graph stays the active
	 * graph — clearing IS a change, but doesn't move the active context.
	 */
	clearSelection() {
		this._activeSelMgr.value?.selectNone();
	}

	// #endregion


	// #region Inspector helpers
	// -------------------------

	/**
	 * Returns a UI-ready summary of a node, suitable for rendering in an
	 * inspector. Excludes label and custom field rows (UI-only). Field entries
	 * carry shape metadata (kind, type, title, description) but NOT live values
	 * — use getFieldBinding(node, fieldName) for reactive value access.
	 *
	 * @param {NWNode} node
	 * @returns {Object|null}
	 */
	getNodeInfo(node) {
		if (!node) return null;

		const fields = (node.fieldsList?.value || [])
			.filter(f => f.fieldType !== FIELD_TYPE.LABEL && f.fieldType !== FIELD_TYPE.CUSTOM)
			.map(f => ({
				name: f.name,
				kind: f.fieldType,
				type: f.valueType?.typeName || null,
				title: f.title || f.name,
				description: f.description || '',
				isArray: !!f.isArray,
			}));

		return {
			id: node.id,
			type: node._serializeKey || node.constructor.name,
			title: node.constructor.nodeName || node.constructor.name,
			icon: node.constructor.icon || null,
			kind: node.constructor.nodeType,
			fields,
		};
	}


	/**
	 * Returns a reactive binding for a single field on a node. Inspector UIs
	 * should use this rather than reaching into node.fieldState directly,
	 * which is internal.
	 *
	 * Returned shape:
	 *   {
	 *     value:       ComputedRef — reactive read of the current value
	 *     setValue:    fn(newValue) — writes through wrapFieldValue's signaling path
	 *     valueRef:    Ref — direct ref for v-model use in widgets
	 *     type:        String — typeName (JSON-safe)
	 *     typeClass:   Function — the VType class (for instanceof / typed widgets)
	 *     kind:        'input' | 'output' | 'prop'
	 *     wired:       ComputedRef<Boolean> — true when an input has a wire connected
	 *     title:       String
	 *     description: String
	 *     isArray:     Boolean
	 *   }
	 *
	 * For compound types (VColor3, VVector2 etc.), `value` is the whole
	 * compound object — render a typed widget against it (color picker,
	 * vector input). The plan deferred per-channel sub-bindings; revisit
	 * if a real consumer needs them.
	 *
	 * @param {NWNode} node
	 * @param {String} fieldName
	 * @returns {Object|null}
	 */
	getFieldBinding(node, fieldName) {

		if (!node || !fieldName) return null;

		const field = (node.fieldsList?.value || []).find(f => f.name === fieldName);
		if (!field) return null;

		const fieldState = node.fieldState?.[fieldName];
		if (!fieldState) return null;

		const graph = node.graph;

		// 'wired' is meaningful for inputs only; reactive on the wires array
		const wired = (field.fieldType === FIELD_TYPE.INPUT && graph?.connMgr)
			? computed(() => graph.connMgr.getConnectionsBySocket(node, field, true).length > 0)
			: ref(false);

		return {
			value: computed(() => fieldState.valueRef.value),
			setValue: (newValue) => { fieldState.val = newValue; },
			valueRef: fieldState.valueRef,
			type: field.valueType?.typeName || null,
			typeClass: field.valueType || null,
			kind: field.fieldType,
			wired,
			title: field.title || field.name,
			description: field.description || '',
			isArray: !!field.isArray,
		};
	}


	/**
	 * Convenience shortcut: write a value into a node's field. Signaling
	 * happens via wrapFieldValue's watch (changeVersion bumps once).
	 *
	 * @param {NWNode} node
	 * @param {String} fieldName
	 * @param {*} value
	 */
	setFieldValue(node, fieldName, value) {
		const fieldState = node?.fieldState?.[fieldName];
		if (fieldState) fieldState.val = value;
	}

	// #endregion


	// #region Evaluation / export
	// ---------------------------

	/**
	 * Returns a compiled per-pixel closure for the root graph. Snapshot at
	 * call time — does not track ongoing graph changes. Re-call when
	 * changeVersion bumps for live-preview UX.
	 *
	 * Closure signature: ({x, y, width, height, mouseX, mouseY}) => {r, g, b}
	 *
	 * @returns {Function|null}
	 */
	getComputeFn() {
		return this.rootGraph.getComputeFunction();
	}


	/**
	 * Single-shot evaluation of the root graph. Writes provided inputs to
	 * input nodes by name, runs topological eval, returns output node values.
	 *
	 * @param {Object} [inputs] - Map of input-name → value.
	 * @returns {Object} - Map of output-name → value.
	 */
	evaluate(inputs = {}) {
		return this.rootGraph.evaluate(inputs);
	}


	/**
	 * Returns a JSON AST of the graph suitable for codegen (e.g. to GLSL).
	 *
	 * Output shape:
	 *   {
	 *     nodes: [{ id, type, kind, fields: [{ name, kind, type, value, wired }, ...], subGraph? }],
	 *     wires: [{ id, from: {nodeId, field, type}, to: {nodeId, field, type}, coalesce }],
	 *     order: [...nodeIds],   // topological execution order
	 *   }
	 *
	 * `coalesce` is null when the wire's src and dst types match. Otherwise:
	 *   { firstOrder: bool, hops: ['VVector2', 'VVector3', 'VColor3'] }
	 * Hop names are the type classes' static `typeName`s — JSON-safe strings,
	 * not class references. The hop chain comes from VTypeRegistry's composed
	 * coalescers (already pre-computed at registry construction).
	 *
	 * Group nodes: 0.0.1b ships nested-only. Each GroupNode in the model carries
	 * a `subGraph` field with the recursive model of its inner graph. Flat-mode
	 * (re-routing wires through Group I/O nodes and inlining contents) is on
	 * the roadmap for 0.0.2 — pass `{ flattenGroups: false }` explicitly to
	 * silence the "not yet implemented" warning when groups are present.
	 *
	 * @param {Object} [options]
	 * @param {Boolean} [options.flattenGroups=true] - reserved; nested-only in 0.0.1b.
	 * @returns {Object}
	 */
	getModel(options = {}) {
		const flattenGroups = options.flattenGroups !== false;
		return this._buildModel(this.rootGraph, flattenGroups);
	}


	/**
	 * Internal: recursively build the model representation of a graph.
	 *
	 * @param {NWGraph} graph
	 * @param {Boolean} flattenGroups
	 * @returns {Object}
	 */
	_buildModel(graph, flattenGroups) {

		const result = { nodes: [], wires: [], order: [] };

		let order;
		try {
			order = graph.getTopologicalOrder();
		} catch (e) {
			console.error('EditorState.getModel: cycle detected in graph', e);
			return result;
		}

		// Nodes (in topological order)
		for (const node of order) {
			result.nodes.push(this._serializeNodeForModel(node, graph, flattenGroups));
		}

		// Wires
		for (const conn of graph.wires.value) {
			if (!conn.inputNode || !conn.outputNode || !conn.inputField || !conn.outputField) continue;
			result.wires.push(this._serializeWireForModel(conn, graph));
		}

		// Topological order as IDs
		result.order = order.map(n => n.id);

		// One-time warning if groups are present and flattenGroups requested
		if (flattenGroups && order.some(n => n.constructor.nodeType === NODE_TYPE.GROUP)) {
			if (!this._didWarnFlatten) {
				console.warn(
					'EditorState.getModel: flattenGroups=true is not yet implemented in 0.0.1b. ' +
					'Group nodes are emitted nested (each has a `subGraph` field). ' +
					'Pass { flattenGroups: false } to silence this warning.'
				);
				this._didWarnFlatten = true;
			}
		}

		return result;
	}


	/**
	 * Internal: build the model entry for a single node.
	 */
	_serializeNodeForModel(node, graph, flattenGroups) {

		const fields = [];
		const fieldsList = node.fieldsList?.value || [];

		for (const field of fieldsList) {

			// labels and custom rows are UI-only, no value to surface
			if (field.fieldType === FIELD_TYPE.LABEL || field.fieldType === FIELD_TYPE.CUSTOM) continue;

			const typeName = field.valueType?.typeName || null;
			const fieldState = node.fieldState?.[field.name];
			const value = fieldState ? fieldState.val : undefined;

			// 'wired' is meaningful for inputs (something connected to its left socket)
			let wired = false;
			if (field.fieldType === FIELD_TYPE.INPUT) {
				try {
					const conns = graph.connMgr.getConnectionsBySocket(node, field, true);
					wired = conns.length > 0;
				} catch (_) {
					wired = false;
				}
			}

			fields.push({
				name: field.name,
				kind: field.fieldType, // 'input' | 'output' | 'prop'
				type: typeName,
				value: this._safeSerializeValue(value),
				wired,
			});
		}

		const entry = {
			id: node.id,
			type: node._serializeKey || node.constructor.name,
			kind: node.constructor.nodeType,
			fields,
		};

		// Nest sub-graph for group nodes (flat-mode TBD per spec note above)
		if (node.constructor.nodeType === NODE_TYPE.GROUP) {
			const subGraph = node.fieldState?.graph?.val;
			if (subGraph instanceof NWGraph) {
				entry.subGraph = this._buildModel(subGraph, flattenGroups);
			}
		}

		return entry;
	}


	/**
	 * Internal: build the model entry for a single wire (connection).
	 *
	 * Reminder on counter-intuitive naming inside Connection:
	 *   conn.inputNode / inputField  = PRODUCER  (source / "from" side)
	 *   conn.outputNode / outputField = CONSUMER (destination / "to" side)
	 */
	_serializeWireForModel(conn, graph) {

		const srcType = conn.inputField.valueType;
		const dstType = conn.outputField.valueType;
		const srcTypeName = srcType?.typeName || null;
		const dstTypeName = dstType?.typeName || null;

		// Coalesce metadata only when src/dst types differ. Hop names are
		// the typeName strings (JSON-safe), not class references.
		let coalesce = null;
		if (srcType && dstType && srcType !== dstType && srcTypeName !== dstTypeName) {
			const meta = graph.typeRegistry?.getMetadata?.(srcType, dstType);
			if (meta) {
				coalesce = {
					firstOrder: !!meta.firstOrder,
					hops: Array.isArray(meta.hops) ? meta.hops.map(h => h?.typeName || null).filter(Boolean) : [],
				};
			}
		}

		return {
			id: conn.id,
			from: { nodeId: conn.inputNode.id, field: conn.inputField.name, type: srcTypeName },
			to:   { nodeId: conn.outputNode.id, field: conn.outputField.name, type: dstTypeName },
			coalesce,
		};
	}


	/**
	 * Internal: best-effort JSON-safe serialization of a field value.
	 * Vector/color values are plain objects — pass through. VType instances
	 * with a serialize() method use it. Functions and unserializable values
	 * become undefined. Primitives pass through.
	 */
	_safeSerializeValue(val) {
		if (val == null) return val;
		if (typeof val === 'function') return undefined;
		if (typeof val.serialize === 'function') {
			try { return val.serialize(); } catch (_) { /* fall through */ }
		}
		if (typeof val === 'object') {
			try { JSON.stringify(val); return val; } catch (_) { return undefined; }
		}
		return val;
	}

	// #endregion


	/**
	 * Lifecycle: clean up watchers, release references.
	 */
	destroy() {
		// Future: stop watchers, clear active SelMgr ref, etc.
		// Stage A: no watchers held yet, nothing to do.
	}


	/**
	 * Generates a unique id for state instances.
	 *
	 * @param {String} prefix
	 * @returns {String}
	 */
	static generateUUID(prefix = 'state') {
		return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
	}
}


/**
 * createEditorState — public factory for building an EditorState.
 *
 * This is the preferred entry point for library consumers. With no args,
 * produces an empty editor (no types, nodes, or coalescers). Pass in
 * `defaultTypes` and `defaultNodeList` from the library to opt into the
 * shipped built-ins:
 *
 *     import { createEditorState, defaultTypes, defaultNodeList } from 'vue3-node-widgets';
 *     const editorState = createEditorState({
 *         types: defaultTypes,
 *         availableNodes: defaultNodeList,
 *     });
 *
 * @param {Object} [options]
 * @returns {EditorState}
 */
export function createEditorState(options = {}) {
	return new EditorState(options);
}


// default export for convenience
export default createEditorState;
