/*
	DevErrors.js
	------------

	This file provides a class that will keep track of some errors as we encounter them,
	to show to the developer who's using our library.

	For example, if a node doesn't provide valid serialization/deserialization methods,
	or if the node has some kind of type error or etc.

	This will be instantiated as part of the NWEditor class, but it's visibility will be
	an option/prop of the NWEditorGraph component.
*/

// vue
import { ref } from 'vue';

// main export class
export default class DevErrors {

	// a list of error messages
	errors = ref([]);

	/**
	 * Constructor
	 */
	constructor(editor){

		// save reference to the editor & a copy of it's is-ready state
		this.editor = editor;

		// this is a ref() type
		this.editorIsReady = this.editor.isReady;
	}


	/**
	 * Add an error to the list
	 *
	 * @param {String} error - the error message to add
	 */
	addError(error){
		this.errors.value.push(error);
	}


	/**
	 * Clear all errors from the list
	 */
	clearErrors(){
		this.errors.value = [];
	}

}
