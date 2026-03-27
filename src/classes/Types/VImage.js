/*
	VImage.js
	---------

	Represents a single image file.

	The stored value shape is a plain object: { name, path, dataUrl }
	- name:    original filename (always available after pick)
	- path:    filesystem path (available in Electron; null in plain browser)
	- dataUrl: base64 data URL (always kept in memory for thumbnail display;
	           only persisted in serialization when serializeAs === 'base64')

	Params (set via static factory methods):
	  serializeAs  'path' (default) | 'base64'
	               'path'   → serializes { name, path }      — lightweight, requires file on disk
	               'base64' → serializes { name, path, dataUrl } — heavier but fully self-contained

	Usage in addField:
	  addField(FIELD_TYPE.INPUT, { name: 'texture', type: VImage })
	  addField(FIELD_TYPE.INPUT, { name: 'icon',    type: VImage.AsBase64() })
*/

import VType from '../VType.js';
import NVImageWidget from '@/components/TypeWidgets/NVImageWidget.vue';

export class VImage extends VType {

	static {
		this.init();
	}

	/** @type {string} Human-readable name */
	static typeName = 'Image';

	/** @type {string} Description */
	static description = 'A single image file (JPEG, PNG, WebP, etc.)';

	/** @type {string} Theme color */
	static themeColor = '#cc44aa';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVImageWidget;

	/** @type {string} Socket style */
	static socketStyle = '4,10,4,10';

	/** @type {*} Default value — fresh object created per-instance in constructor */
	static defaultValue = null;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => v === null || (typeof v === 'object' && !Array.isArray(v));

	/** @type {(value: any) => any} */
	static lintFn = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : null;

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a?.path === b?.path && a?.name === b?.name;

	/** Serialization mode: 'path' (default) or 'base64' */
	static serializeAs = 'path';

	/** Default constructor */
	constructor(value) {

		super(value);

		// Stamp params onto the class so the widget can read them
		this.static.serializeAs = this.static.params?.serializeAs ?? 'path';

		// Always ensure a fresh value object — static defaultValue is null
		// so we build the empty shape here
		if (!this.value || typeof this.value !== 'object') {
			this.value = { name: null, path: null, dataUrl: null };
		}
	}


	/**
	 * Serializes the image value according to the serializeAs param.
	 * Called by NWNode.serialize() when this VType instance has serializeValue().
	 *
	 * @param {Object|null} val - the raw field value { name, path, dataUrl }
	 * @returns {Object|null}
	 */
	serializeValue(val) {
		if (!val || !val.name) return null;
		if (this.static.serializeAs === 'base64') {
			return { name: val.name, path: val.path, dataUrl: val.dataUrl };
		}
		// 'path' mode — omit potentially large dataUrl
		return { name: val.name, path: val.path };
	}


	/**
	 * Reconstructs the image value from serialized data.
	 * Called by NWNode.deserialize() when this VType instance has deserializeValue().
	 *
	 * @param {Object|null} data
	 * @returns {Object}
	 */
	deserializeValue(data) {
		if (!data) return { name: null, path: null, dataUrl: null };
		return {
			name: data.name || null,
			path: data.path || null,
			// dataUrl is restored if it was saved (base64 mode), otherwise null
			// (widget shows no thumbnail until user re-picks in path mode)
			dataUrl: data.dataUrl || null,
		};
	}


	// ---- Static factory methods ----

	/**
	 * Serialize as base64 — includes the full image data in the saved JSON.
	 * Useful for small icons/thumbnails where you want the graph to be fully portable.
	 */
	static AsBase64() {
		return this.addConstructorParam({ serializeAs: 'base64' });
	}
}
