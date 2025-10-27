/*
	Serializer.js
	-------------

	This will provide a class that can be added to the various objects in the project.

	It will be customizable for the types of data each kind of class can contain
	& can have things like hooks set up to handle special cases during serialization/deserialization.

	There is no one-size-fits-all serialization solution for my data & I want to have flexibility
	over the serialization / deserialization process.
*/

import { watch } from 'vue';

// main export
export class Serializer {

	/**
	 * Static utility to check if a value is serializable (i.e., has a serialize() method).
	 * 
	 * @param {Any} value - value to check for presence of .serialize method, if applicable
	 * @returns {boolean} True if the value has a serialize() method
	 */
	static isSerializable(value) {
		return value != null && typeof value.serialize === 'function';
	}

	
	/**
	 * Constructs a new Serializer instance.
	 * 
	 * @param {Object} owner - The object this serializer is attached to
	 * @param {String} ownerName - Debug name for the owner object
	 * @param {Function} serializeFn - User-provided serialization function
	 * @param {Function} deserializeFn - User-provided deserialization function
	 * @param {Ref[]} watches - Array of Vue refs to watch for invalidation
	 * @param {Constructor[]} typePool - Array of types that may be encountered during serialization
	 * @param {Array[[]]} hooks - Array of hook pairs [testFn, callbackFn] for special cases
	 */
	constructor(
		owner,
		ownerName = "unknown",
		serializeFn,
		deserializeFn,
		watches = [],
		typePool = [],
		hooks = []
	){
		// save the object we're responsible for serializing & it's debug name
		this.owner = owner;
		this.ownerName = ownerName;

		// save the user provided serialize/deserialize functions
		this.serializeFn = serializeFn;
		this.deserializeFn = deserializeFn;

		// save list of things to watch for invalidation
		this.watches = watches;

		// save list of types we might encounter
		this.typePool = typePool;

		// save list of hook functions & callbacks for special cases
		this.hooks = hooks;

		// once we serialize we'll store a cache here
		this._cache = null;

		// true when the cache is invalidated
		this._dirty = true;

		// we'll insert our function to the owner's serialize/deserialize methods
		this.owner.serialize = () => this._serialize();
		this.owner.deserialize = (data) => this._deserialize(data);
	}


	/**
	 * Wraps the user provided serialization function with caching and dirty checking.
	 * 
	 * @returns {any} The serialized data.
	 */
	_serialize(){

		// if not dirty, return cached data
		if(!this._dirty){
			return this._cache;
		}

		// call the user-provided serialize function
		const data = this.serializeFn(this.owner, this.typePool, this.hooks);

		// cache the data
		this._cache = data;

		// mark as clean
		this._dirty = false;

		// return the data
		return data;
	}


	/**
	 * Wraps the user provided deserialization function.
	 * 
	 * @param {any} data - The data to deserialize.
	 * @returns {any} The result of deserialization.
	 */
	_deserialize(data){

		// call the user-provided deserialize function
		return this.deserializeFn(this.owner, data, this.typePool, this.hooks);
	}

}
