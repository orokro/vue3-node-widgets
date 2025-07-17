/*
	VTypeRegistry.js
	----------------

	This file provides a class that manages a collection of VType instances,
	and supports type coalescing through a graph structure.

	The NWEditor will instantiate a default version of this class with built-in types,
	but developers can also instantiate their own VTypeRegistry and provide it to the component.
*/

/**
 * Registry for all VType definitions and coalescing logic.
 * Builds and stores first-order and composed coalescers.
 */
import VCoalescer from './VCoalescer.js';

// main export
export class VTypeRegistry {

	/**
	 * Constructs a new VTypeRegistry instance.
	 * 
	 * @param {Function[]} typeList - Array of VType classes to register.
	 * @param {Object} [options]
	 * @param {number} [options.maxHops=4] - Maximum depth to build composed coalescers.
	 */
	constructor(typeList, { maxHops = 4 } = {}) {

		/** @type {Function[]} */
		this.types = typeList;

		/** @type {Map<Function, Map<Function, VCoalescer>>} */
		this.coalescers = new Map();

		this._buildFirstOrder();
		this._buildRecursiveChains(maxHops);
	}


	/**
	 * Build coalescers directly defined by types.
	 */
	_buildFirstOrder() {
		for (const T of this.types) {
			for (const [FromType, fn] of T.fromCoalescers || []) {
				this._setCoalescer(FromType, T, new VCoalescer(fn, {
					firstOrder: true,
					origin: [T],
					hops: [FromType, T]
				}));
			}

			for (const [ToType, fn] of T.toCoalescers || []) {
				const hasFrom = ToType.fromCoalescers?.has?.(T);
				if (!hasFrom) {
					const test = fn(T.defaultValue);
					if (test !== undefined) {
						this._setCoalescer(T, ToType, new VCoalescer(fn, {
							firstOrder: true,
							origin: [T],
							hops: [T, ToType]
						}));
					}
				}
			}
		}
	}


	/**
	 * Build composed coalescers recursively.
	 * @param {number} maxHops
	 */
	_buildRecursiveChains(maxHops) {
		let hops = 2;
		let added;

		do {
			added = false;
			for (const From of this.types) {
				for (const Mid of this.types) {
					const c1 = this.getCoalescer(From, Mid);
					if (!c1) continue;

					for (const To of this.types) {
						if (From === To || this.hasCoalescer(From, To)) continue;

						const c2 = this.getCoalescer(Mid, To);
						if (!c2) continue;

						const testMid = Mid.defaultValue;
						const result = c2.apply(testMid);
						if (result === undefined) continue;

						const composedFn = (val) => {
							const mid = c1.apply(val);
							return c2.apply(mid);
						};

						this._setCoalescer(From, To, new VCoalescer(composedFn, {
							firstOrder: false,
							origin: [],
							hops: [...c1.hops, To]
						}));
						added = true;
					}
				}
			}
			hops++;
		} while (added && hops <= maxHops);
	}


	/**
	 * Store a coalescer between two types.
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @param {VCoalescer} coalescer
	 */
	_setCoalescer(fromType, toType, coalescer) {
		if (!this.coalescers.has(fromType)) this.coalescers.set(fromType, new Map());
		this.coalescers.get(fromType).set(toType, coalescer);
	}


	/**
	 * Retrieve a coalescer between two types.
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @returns {VCoalescer|null}
	 */
	getCoalescer(fromType, toType) {
		return this.coalescers.get(fromType)?.get(toType) || null;
	}
	

	/**
	 * Check if a coalescer exists between two types.
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @returns {boolean}
	 */
	hasCoalescer(fromType, toType) {

		return this.coalescers.has(fromType) && this.coalescers.get(fromType).has(toType);
	}


	/**
	 * Test if a coalescer exists.
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @returns {boolean}
	 */
	canCoalesce(fromType, toType) {
		return this.coalescers.has(fromType) && this.coalescers.get(fromType).has(toType);
	}


	/**
	 * Run a coalescer to convert a value.
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @param {*} value
	 * @returns {*} The converted value
	 */
	coalesce(fromType, toType, value) {
		const coalescer = this.getCoalescer(fromType, toType);
		if (!coalescer) throw new Error(`No coalescer from ${fromType.typeName} to ${toType.typeName}`);
		return coalescer.apply(value);
	}


	/**
	 * Get coalescer metadata.
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @returns {Object|null}
	 */
	getMetadata(fromType, toType) {
		const c = this.getCoalescer(fromType, toType);
		return c ? {
			firstOrder: c.firstOrder,
			origin: c.origin,
			hops: c.hops,
			reliability: c.getReliabilityScore()
		} : null;
	}
}
