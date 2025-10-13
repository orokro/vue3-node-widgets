/**
	Serializer.js
	-------------

	Provides caching, reactive invalidation, and optional type-based hook callbacks
	for use in NWNode, NWGraph, and related systems.

	This class DOES NOT perform automatic deep serialization or object instantiation.

	Instead, each domain object (e.g. NWNode, NWGraph) implements its own `serialize()`
	and `deserialize()` methods. The serializer only wraps and caches the data and
	provides utility for managing reactivity, versioning, and hooks.

	Usage pattern:

	// in constructor
	this.serializer = new Serializer("NWGraph", [
		[
			item => item instanceof NWGraph,
			(item, s) => s._graphMap.set(item.id, item)
		]
	]);

	// in your manual deserialize()
	const d = this.serializer.deserialize(data);
	if (!d) return;

	this.subGraphs = d.subGraphs.map(g => {
		const sub = new NWGraph().deserialize(g);
		this.serializer.runHooks(sub);
		return sub;
	});
 */

import { watch } from 'vue';

// main export
export class Serializer {

	/**
	 * @param {String} [ownerName="unknown"] - Optional owner name for debugging.
	 * @param {Array<[Function, Function]>} [hooks=[]] - Optional array of hook pairs [testFn, callbackFn].
	 */
	constructor(ownerName = "unknown", hooks = []) {

		/** @type {String} Debug name for this serializer instance. */
		this.ownerName = ownerName;

		/** @type {Boolean} Indicates whether cache is invalidated. */
		this._dirty = true;

		/** @type {String|null} Most recent cache key (hash). */
		this._cacheKey = null;

		/** @type {Object|null} Last serialized object. */
		this._cache = null;

		/** @type {Set<Serializer>} Parent serializers that depend on this one. */
		this._parents = new Set();

		/** @type {Array<Function>} Vue watcher stop handles. */
		this._watchStops = [];

		/** @type {Array<[Function, Function]>} Hook functions for type-based callbacks. */
		this._hooks = hooks;
	}


	// ------------------------------------------------------------
	// 🔁 Reactive invalidation system
	// ------------------------------------------------------------

	/**
	 * Adds Vue refs/reactives to watch for automatic invalidation.
	 * When any dependency changes, this serializer marks itself dirty.
	 * 
	 * @param {Array} deps - Array of Vue refs/reactives to watch.
	 */
	watch(deps = []) {

		if (!deps || !deps.length)
			return;

		const stop = watch(deps, () => this.invalidate());
		this._watchStops.push(stop);
	}


	/**
	 * Invalidates this serializer and notifies all parent serializers.
	 */
	invalidate() {

		if (this._dirty)
			return;

		this._dirty = true;

		for (const parent of this._parents)
			parent.invalidate();		
	}


	/**
	 * Registers a parent serializer (for cascading invalidation).
	 * 
	 * @param {Serializer} parent - Parent serializer reference.
	 */
	addParent(parent) {
		if (!parent)
			return;
		this._parents.add(parent);
	}


	// ------------------------------------------------------------
	// ⚙️ Core serialization logic
	// ------------------------------------------------------------

	/**
	 * Serializes the given data object and caches the result.
	 * 
	 * @param {Serializer|null} outer - The outer serializer (if any).
	 * @param {Object} data - The raw data object to serialize.
	 * @param {any} [instance=null] - Optional reference to the source instance.
	 * @param {string|null} [id=null] - Optional ID for identification.
	 * @returns {Object} Serialized object containing a cache key and data.
	 */
	serialize(outer, data, instance = null, id = null) {

		// link to parent serializer if provided
		if (outer)
			this.addParent(outer);

		// if cache is valid, skip recompute
		if (!this._dirty && this._cache)
			return this._cache;
		

		// compute stable hash for change detection
		const stableKey = this._computeHash(data);

		// build output object (note: shallow clone)
		const out = {
			_cacheKey: stableKey,
			...data
		};

		// update cache
		this._cache = out;
		this._cacheKey = stableKey;
		this._dirty = false;

		return out;
	}


	/**
	 * Computes a simple, deterministic hash from object content.
	 * @private
	 * @param {Object} obj
	 * @returns {String} hex hash string
	 */
	_computeHash(obj) {

		try {
			const str = JSON.stringify(obj);
			let hash = 0;

			for (let i = 0; i < str.length; i++) {
				const chr = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + chr;
				hash |= 0;
			}// next i

			return Math.abs(hash).toString(16);
			
		} catch (e) {
			return Math.random().toString(16).slice(2, 10);
		}
	}


	// ------------------------------------------------------------
	// 🔄 Deserialization logic
	// ------------------------------------------------------------

	/**
	 * Validates incoming data against the cache key.
	 * Returns `null` if unchanged, or the data (without mutation) if new.
	 * 
	 * Does not instantiate or mutate objects — your class must do that manually.
	 * 
	 * @param {Object} data - Raw data input.
	 * @returns {Object|null} Returns null if data unchanged, else the data object.
	 */
	deserialize(data) {

		if (!data)
			return null;

		// skip if cache key matches
		if (data._cacheKey && data._cacheKey === this._cacheKey)
			return null;
		

		// update key
		this._cacheKey = data._cacheKey || null;

		// return raw data for manual hydration
		return data;
	}


	// ------------------------------------------------------------
	// 🧩 Hook system
	// ------------------------------------------------------------

	/**
	 * Adds a new hook pair dynamically.
	 * 
	 * @param {Function} testFn - Predicate function, receives the item, returns true/false.
	 * @param {Function} callbackFn - Called when testFn returns true.
	 */
	addHook(testFn, callbackFn) {
		this._hooks.push([testFn, callbackFn]);
	}


	/**
	 * Executes all hooks that match the given item.
	 * 
	 * Should be called manually by deserializers after instantiating new items.
	 * 
	 * @param {any} item - The object to test against hooks.
	 */
	runHooks(item) {

		for (const [testFn, cb] of this._hooks) {
			try {
				if (testFn(item)) {
					cb(item, this);
				}
			} catch (err) {
				console.warn(`Serializer hook failed in ${this.ownerName}:`, err);
			}
		}

		// propagate to parent serializers
		for (const parent of this._parents) {
			parent.runHooks(item);
		}
	}


	// ------------------------------------------------------------
	// 🧹 Cleanup
	// ------------------------------------------------------------

	/**
	 * Destroys this serializer and cleans up watchers.
	 */
	destroy() {

		for (const stop of this._watchStops) {
			try { stop(); } catch (e) { }
		
		}// next stop

		this._watchStops = [];
		this._parents.clear();
		this._cache = null;
		this._hooks = [];
	}

}
