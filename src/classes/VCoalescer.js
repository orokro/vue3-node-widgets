/*
	VCoalescer.js
	-------------

	Wrapper class for a coalescing function with metadata.
*/

// main export
export default class VCoalescer {

	/**
	 * Constructs a new VCoalescer instance.
	 * 
	 * @param {Function} fn - The actual function that performs the coalescing.
	 * @param {Object} options - Metadata about the coalescer.
	 * @param {boolean} options.firstOrder - Whether this function is explicitly provided by a developer.
	 * @param {Function[]} options.origin - Array of type classes that defined this coalescer (usually 1 for first-order).
	 * @param {Function[]} options.hops - The path of type classes used to reach this conversion (e.g., [A, B, C]).
	 */
	constructor(fn, { firstOrder = false, origin = [], hops = [] } = {}) {

		/** @type {Function} */
		this.fn = fn;

		/** @type {boolean} */
		this.firstOrder = firstOrder;

		/** @type {Function[]} */
		this.origin = origin;

		/** @type {Function[]} */
		this.hops = hops;
	}


	/**
	 * Applies the coalescer to a value.
	 * @param {*} value - The value to convert.
	 * @returns {*} The result of the conversion.
	 */
	apply(value) {
		return this.fn(value);
	}


	/**
	 * Returns a reliability score for this coalescer.
	 * Lower is better. First-order functions always score 0.
	 * @returns {number}
	 */
	getReliabilityScore() {
		return this.firstOrder ? 0 : this.hops.length;
	}

	
	/**
	 * Returns whether the coalescer is system-generated (not first-order).
	 * @returns {boolean}
	 */
	isComposed() {
		return !this.firstOrder;
	}

}
