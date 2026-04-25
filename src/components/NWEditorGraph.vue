<!--
	NWEditorGraph.vue
	-----------------

	This is the main component for mounting user-editable node widget graphs.

	This rectangular space will be draggable, zoomable, and will contain a grid of nodes and wires connecting them.

	This component will provide it's own state (NWSystem) class if none is provided.
-->
<template>

	<!-- main outermost wrapper for the entire node-graph system -->
	<div class="NWEditorGraph">

		<NWStyle :theme="theme">
			
			<!-- wrapper used to reset the relative/absolute positioning for the component
			(the user might style our outer .NWEditorGraph element via style attrs/props and/or css, etc )-->
			<div 
				v-if="ctxRef != null"
				class="positioning-reset"			
			>
				<!-- always show our contexts root graph -->
				<NodeGraphRenderer
					:editor="ctxRef"
					:graph="ctxRef.rootGraphRef.value"
					:backgroundScale="backgroundScale"
					:showAddButton="showAddButton"
					@showAddMenu="handleShowAddMenu"
				/>
			</div>

			<!-- this wrapper does not scroll, and allows for overflow. Misc UI, such as errors, toasts, menus, etc should mount here -->
			<div class="ui-container fill-parent">

				<!-- The breadcrumb list, only shown if we're in a sub-graph -->
				<BreadcrumbList 
					v-if="ctxRef != null"
					:editor="ctxRef"
				/>				
			</div>

			<!-- tool tip for errors when wiring up sockets -->
			<CursorPopup 
				ref="cursorPopupEl"
			/>

			<!-- Auto-mount AddNodeMenu globally if no user-mounted instance exists -->
			<Teleport v-if="isCurrentHost(hostId)" :to="menuMountEl">
				<AddNodeMenu :internalMount="true" />
			</Teleport>

		</NWStyle>

	</div>
</template>
<script setup>

// vue
import { ref, shallowRef, onMounted, provide, watch, computed, onUnmounted } from 'vue';

// components
import NodeGraphRenderer from '@Components/NodeGraphRenderer.vue';
import AddNodeMenu from '@Components/AddNodeMenu.vue';
import CursorPopup from '@Components/CursorPopup.vue';
import BreadcrumbList from './BreadcrumbList.vue';
import NWStyle from './NWStyle.vue';

// our app
import NWEditor from '@src/classes/NWEditor.js';
import { createEditorState } from '@src/classes/EditorState.js';

// lib/misc
import DragHelper from 'gdraghelper';

// composable
import { useAddMenu } from '@Composables/useAddMenu.js';

/*
	Component ownership rules — locked at mount time, no dynamic state-swap in 0.0.1b:

	  EXTERNAL (shared) state:  consumer passes :state (an EditorState created via
	                            createEditorState). Lifetime owned by consumer; we never
	                            destroy it on unmount.

	  INTERNAL state:           consumer passes any of :types / :coalescers /
	                            :available-nodes / :initial-data and NO :state. We build
	                            an EditorState internally, destroy it on unmount.

	  LEGACY:                   neither :state nor convenience props provided. NWEditor
	                            falls back to its standalone path (auto-loads built-in
	                            types + nodes). The :graph prop still works in this mode
	                            for back-compat with the existing dev app.

	Mutually exclusive: providing :state with any of the convenience props is a
	consumer error — we honor :state and emit a console.warn.
*/

// define some props
const props = defineProps({

	// NEW — shared EditorState (controlled mode)
	state: {
		type: Object,
		default: null,
	},

	// NEW — convenience props for uncontrolled mode (mutually exclusive with :state)
	types: {
		type: Array,
		default: null,
	},
	coalescers: {
		type: Array,
		default: null,
	},
	availableNodes: {
		type: Array,
		default: null,
	},
	initialData: {
		type: Object,
		default: null,
	},

	// LEGACY — initial base graph (kept for back-compat with existing dev app).
	// In legacy mode, sets the rootGraph on the per-window NWEditor.
	graph: {
		type: Object,
		default: null
	},

	// allow the background to have some auto-scale applied by component
	backgroundScale: {
		type: Number,
		default: 20
	},

	// optional - element to teleport our menu to
	menuMountEl: {
		type: [Object, String],
		default: 'body'
	},

	// optional theme object
	theme: {
		type: Object,
		default: () => ({})
	},

	// true to show a built-in add menu button
	showAddButton: {
		type: Boolean,
		default: true
	},

});


// els
const cursorPopupEl = ref(null);
provide('cursorPopupEl', cursorPopupEl);

// per-window NWEditor (the "view"). When state is provided/created, this editor
// is constructed in shared-state mode and delegates typeRegistry / availableNodes
// to the EditorState while keeping its own breadcrumbs and current view.
let ctx = null;
const ctxRef = shallowRef(null);
provide('ctx', ctxRef);

// shared EditorState (if any). Provided to descendants for direct access.
const stateRef = shallowRef(null);
provide('state', stateRef);

// true if WE created the EditorState (must destroy on unmount). False if it was
// passed in via :state (consumer owns its lifecycle).
let ownsState = false;

// make a new DragHelper instance
const dh = new DragHelper();
provide('dh', dh);

// composable for menu control
const {
	menuIsMounted,
	registerHost,
	unregisterHost,
	claimMenuHost,
	showAddMenu,
	isCurrentHost,
} = useAddMenu();

const hostId = registerHost();


/**
 * Determine ownership mode and build/use the EditorState as appropriate.
 * Called once at mount time — no dynamic switching after this.
 */
function resolveStateOwnership() {

	const hasConvenienceProps = (
		(props.types && props.types.length > 0) ||
		(props.coalescers && props.coalescers.length > 0) ||
		(props.availableNodes && props.availableNodes.length > 0) ||
		props.initialData
	);

	// EXTERNAL — :state takes precedence. Warn if convenience props were also passed.
	if (props.state) {
		if (hasConvenienceProps) {
			console.warn(
				'<NWEditorGraph>: :state and convenience props (:types, :coalescers, ' +
				':available-nodes, :initial-data) are mutually exclusive. Honoring :state ' +
				'and ignoring convenience props.'
			);
		}
		stateRef.value = props.state;
		ownsState = false;
		return;
	}

	// INTERNAL — build an EditorState from the convenience props.
	if (hasConvenienceProps) {
		stateRef.value = createEditorState({
			types:          props.types          || [],
			coalescers:     props.coalescers     || [],
			availableNodes: props.availableNodes || [],
			initialData:    props.initialData    || null,
		});
		ownsState = true;
		return;
	}

	// LEGACY — no state, no convenience props. ctx will be created in standalone mode.
	stateRef.value = null;
	ownsState = false;
}


// on mounted, initialize the component and optionally, state
onMounted(() => {

	// 1. Lock state ownership for this component's lifetime.
	resolveStateOwnership();

	// 2. Create the per-window NWEditor. Shared-state mode if we have an EditorState,
	//    otherwise legacy standalone (auto-loads built-in types + nodes).
	ctx = stateRef.value
		? new NWEditor({ state: stateRef.value })
		: new NWEditor();
	ctxRef.value = ctx;

	if (claimMenuHost(hostId)) {
		// this instance becomes the menu host
		// console.log("NWEditorGraph: claimed menu host", hostId);
	}

	// 3. LEGACY back-compat: if a :graph prop was passed, set it as the rootGraph.
	//    This is only meaningful in legacy mode — in shared-state mode, the
	//    EditorState owns the root graph and :graph is ignored.
	if (props.graph && !stateRef.value)
		ctxRef.value.setRootGraph(props.graph);
});


onUnmounted(() => {
	unregisterHost(hostId);

	// If we created the EditorState ourselves, destroy it. External state stays
	// alive (consumer owns it).
	if (ownsState && stateRef.value) {
		stateRef.value.destroy?.();
	}

	// Future: ctx.destroy() once NWEditor grows lifecycle teardown.
});


// LEGACY back-compat: update root graph if the :graph prop changes.
// In shared-state mode this is ignored — :graph isn't part of the shared-state contract.
watch(() => props.graph, (newVal) => {
	if (!ctxRef.value) return;
	if (stateRef.value) return; // shared-state mode — :graph is legacy-only
	if (newVal) ctxRef.value.setRootGraph(newVal);
});


// ─── Per-window navigation API (exposed) ─────────────────────────────────────

/**
 * Reactive ref to the graph this window is currently displaying. Different
 * <NWEditorGraph> instances pointing at the same EditorState can show
 * different graphs (root vs. drilled-into-a-sub-graph), so this is per-window.
 */
const currentGraph = computed(() => ctxRef.value?.rootGraphRef?.value || null);


/**
 * Reactive ref to the breadcrumb labels for THIS window's currentGraph,
 * walked from root → leaf via NWGraph.ownerNode back-pointers.
 *
 * Distinct from editorState.activeGraphPath, which reflects the path to the
 * actively-selected graph (last-touched-wins) and may not match this window
 * if the user just clicked something in a different window.
 */
const currentGraphPath = computed(() => {
	const path = [];
	const visited = new Set();
	let g = currentGraph.value;
	while (g && !visited.has(g)) {
		visited.add(g);
		const isRoot = !g.ownerNode;
		const name = g.name?.value || (isRoot ? 'Root Graph' : 'Group');
		path.unshift(name);
		g = g.ownerNode?.graph || null;
	}
	return path;
});


/**
 * Navigate this window back to the root graph (clearing breadcrumbs).
 * In shared-state mode this means jump to editorState.rootGraph; in legacy
 * mode it pops the breadcrumb stack to the top.
 */
function goToRoot() {
	if (!ctx) return;
	if (stateRef.value) {
		ctx.setRootGraph(stateRef.value.rootGraph);
	} else if (ctx.parentGraphs?.value?.length > 0) {
		ctx.selectBreadcrumb(0);
	}
	// else: already at root, no-op
}


/**
 * Drill this window into a sub-graph. Accepts either an NWGraph directly
 * or a GroupNode whose `graph` field holds the sub-graph.
 *
 * @param {NWGraph|NWNode} graphOrNode
 */
function openSubGraph(graphOrNode) {
	if (!ctx) return;
	let target = graphOrNode;
	// allow passing a GroupNode — extract its sub-graph
	if (target?.fieldState?.graph?.val) {
		target = target.fieldState.graph.val;
	}
	if (target?.nodes && target?.wires) {
		ctx.openSubGraph(target);
	}
}


/**
 * Returns the EditorState (shared or internally-created), or null in legacy mode.
 * Useful for consumers who used the convenience-props path and want to grab the
 * state object that was built for them.
 *
 * @returns {EditorState|null}
 */
function getState() {
	return stateRef.value;
}


/**
 * LEGACY: returns the per-window NWEditor instance. Kept for back-compat with
 * existing consumers (notably the dev app); new consumers should reach for
 * the EditorState via getState() instead.
 *
 * @returns {NWEditor}
 */
function getContext() {
	return ctx;
}


// define our public API
defineExpose({
	// new API
	getState,
	currentGraph,
	currentGraphPath,
	goToRoot,
	openSubGraph,
	// legacy API
	getContext,
});


/**
 * Called by NodeGraphRenderer when user triggers "add node" action.
 * Instead of directly showing menu in ctx, delegate to global composable.
 */
function handleShowAddMenu(context) {

	const { event, graph, viewport } = context;
	
	const rect = viewport.el.getBoundingClientRect();

	const x = event.clientX;
	const y = event.clientY;
	const spawnX = (event.clientX - rect.left - viewport.panX.value) / viewport.zoomScale.value;
	const spawnY = (event.clientY - rect.top - viewport.panY.value) / viewport.zoomScale.value;

	// prepare graph context
	const gCtx = { 
		...context, 
		ctx, 
		pos: { x, y },
		spawn: { x: spawnX, y: spawnY },		
	};

	// use composable
	showAddMenu({
		x,
		y,
		graphCtx: gCtx,
		nwSystem: ctx,
		availableNodes: ctx.availableNodes.value,
	});
	
}

</script>
<style lang="scss" scoped>

	// main outer wrapper for the entire node-graph system
	.NWEditorGraph {

		// some default styles
		/* border: 2px solid red; */
		// border-radius: 4px;

		font-family: sans-serif;
		
		// this will fill our parent container 100% width and height, with relative positioning
		// this way, the main root element, NWEditorGraph, can be styled by the user and flow in their layout however they see fit
		position: relative;
		width: 100%;
		height: 100%;

		// both the ui container and the editor container will fill the parent container, on top of each other
		.fill-parent {

			// fill the parent container, with no flow
			position: absolute;
			inset: 0px 0px 0px 0px;

		}// .fill-parent
		

		// the UI layer itself shouldn't have any pointer interactions, though it's children may.
		.ui-container {

			// ui container doesn't respond to zooming, so this will have a normal font size
			font-size: 20px;

			pointer-events: none;

			&>* {
				pointer-events: initial;
			}
			
		}// .ui-container

		* {
			box-sizing: border-box;
			user-select: none;

			// for debug
			// text-decoration: underline !important;
		}

	}// .NWEditorGraph

</style>
