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

		// build composed coalescers recursively
		this._buildComposedCoalescers(maxHops);

		// for debug, print all the coalescers we have built
		// this.printInfo();
	}


	/**
	 * For debugging: print info about the registry and its coalescers.
	 */
	printInfo(){

		console.log('VTypeRegistry Info:');
		console.log('-------------------');

		// print all the keys in our coalescers map & if their first order
		for (const [key, coalescer] of this.coalescers.entries()){
		
			const isFirstOrder = coalescer.firstOrder;
			const kindString = `[${isFirstOrder ? 'First Order' : 'Composed'}]`;

			const getPathFromHops = (coalescer)=>{
				return coalescer.hops.map(h => h.typeName).join(' -> ');
			}
			const path = isFirstOrder ? key : getPathFromHops(coalescer);
			console.log(`${kindString} \t ${path}`);
		}
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



	_buildComposedCoalescers(maxHops = 4) {

		// right, so, in our map we have keys like "VNumber->VInteger", 
		// and so far, in _buildFirstOrder() we've stored the coalescers
		// we got provided from the Types themselves.

		// But now we can build out composed coalescers, using the existing
		// ones we have as building blocks.

		// lets first build a hypothetical list of every Type->Type pair

		let allPairs = [];
		for (const From of this.types) {

			for (const To of this.types) {

				if (From !== To) {

					const key = this._getFromToKey(From, To);

					// only add if we don't have it from first order already
					if(!this.coalescers.has(key))
						allPairs.push({key, from: From, to: To});
				}

			}// next To

		}// next From

		// function to get all the current types we can current go from to
		const getFroms = (FromType)=>{

			let froms = [];
			for (const To of this.types){

				const key = this._getFromToKey(FromType, To);
				if (this.coalescers.has(key)) {
					froms.push(To);
				}
			}
			return froms;
		}

		// function to get all Tos for this type
		const getTos = (ToType)=>{
			let tos = [];
			for (const From of this.types){

				const key = this._getFromToKey(From, ToType);
				if (this.coalescers.has(key)) {
					tos.push(From);
				}
			}
			return tos;
		}
		
		// loop until done
		let done = false;
		while(!done){

			// get the total number of pairs we have 
			const potentialPairsCount = allPairs.length;

			// clone array so we can mutate original
			const allPairsClone = [...allPairs];

			// loop over allPairs & see if we can compose any of them
			for( const {key, from: From, to: To} of allPairsClone) {

				// get all the froms and tos
				const froms = getFroms(From);
				const tos = getTos(To);

				// make new array that is the intersection of both froms and tos
				const common = froms.filter(f => tos.includes(f));

				// no common types, skip
				if (common.length === 0)
					continue; 

				// otherwise, we'll compose with the first one we found
				const Mid = common[0]; // take the first common type

				// get the coalescers for From->Mid and Mid->To
				const c1 = this.getCoalescer(From, Mid);
				const c2 = this.getCoalescer(Mid, To);

				// if we don't have both, skip
				if (!c1 || !c2)
					continue;

				// compose the two functions
				const composedFn = (val) => {
					const mid = this.coalesce(From, Mid, val);
					return this.coalesce(Mid, To, mid);
				};

				// create a new coalescer for From->To
				const composedCoalescer = new VCoalescer(composedFn, {
					firstOrder: false,
					origin: [From, Mid, To],
					hops: [...c1.hops, ...c2.hops.filter(i=>c1.hops.indexOf(i) === -1)]
				});

				// store the composed coalescer
				this._setCoalescer(From, To, composedCoalescer);

				// remove this key from the allPairs list
				allPairs = allPairs.filter(i => i.key !== key);

			}// next {key, from, to}

			// if the total number of pairs didn't change, we're done
			if (allPairs.length === potentialPairsCount)
				done = true;
		}// wend

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
