// src/composables/useAddMenu.js
// ------------------------------------------------------------
// Global singleton composable for AddNodeMenu orchestration.
// Ensures that only ONE AddNodeMenu is ever mounted, even if
// multiple NWEditorGraph instances exist simultaneously.

import { ref, shallowRef, nextTick } from 'vue';


// ------------------------------------------------------------
// 🔸 Reactive shared state
// ------------------------------------------------------------
const menuIsMounted = ref(false);      // whether a menu component exists
const menuIsOpen = ref(false);         // visibility (shown/hidden)
  // data passed to showAddMenu()
const mountedMenuEl = shallowRef(null);// actual component ref or el
const activeHostId = ref(null);        // ID of the NWEditorGraph that currently owns the menu
const manuallyMounted = ref(false);   // if true, menu was mounted manually outside of NWEditorGraph
const menuOptions = shallowRef(
	{
		x: 0,
		y: 0,
		graphCtx: null,
		nwSystem: null,
		availableNodes: []
	}
);


// ------------------------------------------------------------
// 🔸 Internal helpers
// ------------------------------------------------------------

// Generate unique IDs for each claiming host
let uidCounter = 0;
function nextUid() {
	return ++uidCounter;
}

// Map to track which hosts are alive
const activeHosts = new Set();

// ------------------------------------------------------------
// 🔸 Lifecycle: claiming and releasing host responsibility
// ------------------------------------------------------------


/**
 * Called by NWEditorGraph when it mounts.
 * Returns a unique host ID that it should retain.
 */
function registerHost() {
	const id = nextUid();
	activeHosts.add(id);
	return id;
}


/**
 * Called by NWEditorGraph when it unmounts.
 * If this graph was the active host, release control.
 */
function unregisterHost(id) {
	activeHosts.delete(id);

	if (activeHostId.value === id) {
		activeHostId.value = null;
		menuIsMounted.value = false;
		mountedMenuEl.value = null;
	}
}


/**
 * Attempts to claim ownership of the global AddNodeMenu.
 * Returns true if successful, false otherwise.
 */
function claimMenuHost(id) {

	// if no current host, or previous host no longer exists, claim
	if (!activeHostId.value || !activeHosts.has(activeHostId.value)) {
		activeHostId.value = id;
		return true;
	}
	return activeHostId.value === id; // already host
}


/**
 * Returns whether the given host currently owns the menu.
 */
function isCurrentHost(id) {

	// always return false if the add menu was manually mounted
	if (manuallyMounted.value)
		return false;

	// otherwise return true if the given id matches the active host
	return activeHostId.value === id;
}


// ------------------------------------------------------------
// 🔸 AddNodeMenu component lifecycle
// ------------------------------------------------------------

/**
 * Called by AddNodeMenu.vue when it mounts.
 */
function setMountedMenu(el) {
	mountedMenuEl.value = el;
	menuIsMounted.value = true;
}


/**
 * Called by AddNodeMenu.vue when it unmounts.
 */
function clearMountedMenu() {
	mountedMenuEl.value = null;
	menuIsMounted.value = false;
}


// ------------------------------------------------------------
// 🔸 Menu visibility control
// ------------------------------------------------------------

function showAddMenu(options = {}) {
	menuIsOpen.value = false;
	nextTick(() => {
		menuOptions.value = options;
		menuIsOpen.value = true;
	});
}

function closeMenu() {
	menuIsOpen.value = false;
	menuOptions.value = null;
}


// ------------------------------------------------------------
// 🔸 Public composable API
// ------------------------------------------------------------

export function useAddMenu() {

	return {
		// reactive state
		menuIsMounted,
		menuIsOpen,
		menuOptions,
		mountedMenuEl,
		activeHostId,
		manuallyMounted,

		// component lifecycle
		setMountedMenu,
		clearMountedMenu,

		// visibility control
		showAddMenu,
		closeMenu,

		// host coordination
		registerHost,
		unregisterHost,
		claimMenuHost,
		isCurrentHost,
	};
}
