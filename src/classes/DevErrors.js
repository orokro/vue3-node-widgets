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
import { shallowRef, computed } from 'vue';

// main export class
export default class DevErrors {

	// unique ID counter for error messages
	static errorIdCounter = 0;

	// a list of error messages
	errors = shallowRef([]);

	// a computed property that returns the number of errors
	errorsCount = computed(() => {
		const rawCount = this.errors.value.length;
		const isNotReady = this.editorIsReady.value==true ? 0 : 1;
		return rawCount + isNotReady;
	});

	// the UI will show this list, instead of the raw internal list
	errorsList = computed(() => {

		// convert our internal errors to a format that the UI can use
		const errorsToShow = this.errors.value.map(err => {
			return {
				...err,
				type: 'error',
				deletable: true
			};
		});

		// add our hard coded errors
		if (!this.editorIsReady.value){
			errorsToShow.push({
				text: 'Editor is not ready',
				id: -1,
				type: 'error',
				deletable: false
			});
		}

		// sort by ID (newer errors will have higher IDs)
		return errorsToShow.sort((a, b) => a.id - b.id);
	});


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

		this.errors.value = [...this.errors.value, {
			text: error,
			id: DevErrors.errorIdCounter++
		}];
	}


	/**
	 * Remove an error from the list by it's ID
	 *
	 * @param {Number} id - the ID of the error to remove
	 */
	removeErrorById(id){
		this.errors.value = this.errors.value.filter(err => err.id !== id);
	}


	/**
	 * Clear all errors from the list
	 */
	clearErrors(){
		this.errors.value = [];
	}

}
