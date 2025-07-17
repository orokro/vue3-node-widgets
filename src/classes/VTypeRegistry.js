/*
	VTypeRegistry.js
	----------------

	This file provides a class that manages a collection of VType instances,
	and supports type coalescing through a graph structure.

	The NWEditor will instantiate a default version of this class with built-in types,
	but developers can also instantiate their own VTypeRegistry and provide it to the component.
*/

import {
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
	VType
} from './Types/index.js';

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

		// store our list of Types to manage & coalesce between
		this.types = typeList;

		/** @type {Map<String, VCoalescer>} */
		this.coalescers = new Map();

		// loop over our provided types & extract their built-in coalescers functions
		this._buildFirstOrder();

		this.printInfo();

		// build composed coalescers recursively
		// this._buildRecursiveChains(maxHops);
	}


	/**
	 * For debugging: print info about the registry and its coalescers.
	 */
	printInfo(){

		console.log('VTypeRegistry Info:');
		console.log('-------------------');

		// print all the keys in our coalescers map & if their first order
		for (const [key, coalescer] of this.coalescers.entries())
			console.log(`[${coalescer.firstOrder ? 'First Order' : 'Composed'}] \t ${key}`);
		
	}


	/**
	 * Build coalescers directly defined by types.
	 */
	_buildFirstOrder() {

		let showLogs = true;
		showLogs = false;

		// loop over the list of Types we have passed in
		for (const T of this.types) {

			if(showLogs) console.log('\nBuilding coalescers for:', T.typeName);

			// loop over the from-coalescers defined by this type
			// i.e. how it defined how to convert from other types to itself
			for (const [FromType, fn] of T.fromCoalescers || []) {

				// log the from to description
				if(showLogs) console.log(`\tFrom ${FromType.typeName} to ${T.typeName}: ${fn.toString()}`);

				const ToType = T;
				this._setCoalescer(
					FromType,
					ToType, 
					new VCoalescer(fn, {
						firstOrder: true,
						origin: [T],
						hops: [FromType, T]
					}
				));

			}// next [FromType, fn]

			// loop over the to-coalescers defined by this type
			// i.e. how it defined how to convert from itself to other types
			for (const [ToType, fn] of T.toCoalescers || []) {

				// log the from to description
				if(showLogs) console.log(`\tTo ${ToType.typeName} from ${T.typeName}: ${fn.toString()}`);

				// if the target type specifies how to convert from this type,
				// we don't need to add a coalescer for it
				// (we should always prefer how types convert to themselves)
				const hasFrom = ToType.fromCoalescers?.has?.(T);
				if (!hasFrom) {

					// we'll allow devs to return 'undefined; for their to-coalescers functions
					// and if we do, we can just skip adding this coalescer

					// pass in in new default instance of this type
					const test = fn(new T(T.defaultValue));
					if (test !== undefined) {

						this._setCoalescer(T, ToType, new VCoalescer(fn, {
							firstOrder: true,
							origin: [T],
							hops: [T, ToType]
						}));
					}
				}
			}
		}// next T

	}// [ToType, fn]


	/**
	 * Build composed coalescers recursively.
	 * @param {number} maxHops
	 */
	_buildRecursiveChains(maxHops) {
		let hops = 2;
		let added;

		return;

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
	 * Generate a key to user for our map
	 * 
	 * @param {Function} fromType - from type class (e.g., VNumber, VVector3)
	 * @param {Function} toType - to type class (e.g., VInteger, VColor3)
	 * @returns {String} A unique key for the coalescer path
	 */
	_getFromToKey(fromType, toType) {
		return `${fromType.typeName}->${toType.typeName}`;
	}


	/**
	 * Store a coalescer between two types.
	 * 
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @param {VCoalescer} coalescer
	 */
	_setCoalescer(fromType, toType, coalescer) {

		// get a key
		const key = this._getFromToKey(fromType, toType);

		// if we already have this path, GTFO, we'll only add it once
		// because we loop over the first order coalescers from our types
		// they'll set themselves first, so we don't need to overwrite them with composed ones
		if(this.coalescers.has(key))
			return;
		
		// otherwise, store it
		this.coalescers.set(key, coalescer);
	}


	/**
	 * Retrieve a coalescer between two types.
	 * 
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @returns {VCoalescer|null}
	 */
	getCoalescer(fromType, toType) {

		const key = this._getFromToKey(fromType, toType);
		return this.coalescers.get(key) || null;
	}
	

	/**
	 * Check if a coalescer exists between two types.
	 * 
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @returns {boolean}
	 */
	hasCoalescer(fromType, toType) {

		const key = this._getFromToKey(fromType, toType);
		return this.coalescers.has(key);
	}


	/**
	 * Test if a coalescer exists.
	 * 
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @returns {boolean}
	 */
	canCoalesce(fromType, toType) {
		return this.coalescers.has(fromType) && this.coalescers.get(fromType).has(toType);
	}


	/**
	 * Run a coalescer to convert a value.
	 * 
	 * @param {Function} fromType
	 * @param {Function} toType
	 * @param {*} value
	 * @returns {*} The converted value
	 */
	coalesce(fromType, toType, value) {

		const coalescer = this.getCoalescer(fromType, toType);
		if (!coalescer) 
			throw new Error(`No coalescer from ${fromType.typeName} to ${toType.typeName}`);
		return coalescer.apply(value);
	}


	/**
	 * Get coalescer metadata.
	 * 
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
