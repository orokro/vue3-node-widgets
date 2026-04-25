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
import { ref, shallowRef } from 'vue';

// our app
import { VTypeRegistry } from './VTypeRegistry';
import { NWGraph } from './NWGraph';
import VCoalescer from './VCoalescer';

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

		// 7. Initial data hydration (replaces root graph if provided).
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
	 * mutations and by NWNode.requestComputeUpdate (once wired in).
	 */
	_bumpVersion() {
		this.changeVersion.value++;
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
	 * Replace state from serialized data. Resets to root and clears selection.
	 * (Stage A: minimal implementation. Will be enriched in later tasks.)
	 *
	 * @param {Object} data - Same shape as serialize() output.
	 */
	deserialize(data) {
		const newGraph = new NWGraph(this.typeRegistry);
		newGraph.deserialize(data);
		this.rootGraph = newGraph;
		this._activeSelMgr.value = newGraph.selMgr;
		this._bumpVersion();
		return this;
	}


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
