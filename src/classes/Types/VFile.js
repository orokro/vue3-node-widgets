/*
	VFile.js
	--------

	Represents one or more selected files.

	The stored value is a plain array of file objects: Array<{ name, path, data }>
	- name:  original filename
	- path:  filesystem path (Electron) or null (browser)
	- data:  base64-encoded file content, populated at pick time when serializeAs === 'binary'

	Even when the field is single-file only, the value is always an array
	(a single-file field holds an array of length ≤ 1). This keeps downstream
	node code uniform regardless of the multiple param.

	Params (set via static factory methods):
	  multiple     false (default) | true
	               Whether the file picker allows selecting multiple files at once.
	               In single mode, picking a new file replaces the existing one.
	               In multiple mode, new picks are appended (existing list preserved).

	  accept       '*' (default) | any valid HTML accept string, e.g. '.pdf,.docx' or 'text/*'
	               Passed directly to the file input's accept attribute.

	  serializeAs  'path' (default) | 'binary'
	               'path'   → serializes { name, path }     — lightweight; file must exist on disk
	               'binary' → serializes { name, path, data } — reads file at pick time as base64

	Usage in addField:
	  addField(FIELD_TYPE.INPUT, { name: 'files',    type: VFile })
	  addField(FIELD_TYPE.INPUT, { name: 'pdfs',     type: VFile.Multiple().Accept('.pdf') })
	  addField(FIELD_TYPE.INPUT, { name: 'embedded', type: VFile.AsBinary() })
*/

import VType from '../VType.js';
import NVFileWidget from '@/components/TypeWidgets/NVFileWidget.vue';

export class VFile extends VType {

	static {
		this.init();
	}

	/** @type {string} Human-readable name */
	static typeName = 'File';

	/** @type {string} Description */
	static description = 'One or more files selected from disk';

	/** @type {string} Theme color */
	static themeColor = '#8844cc';

	/** @type {Function} Vue component for the node widget */
	static nodeWidgetComponent = NVFileWidget;

	/** @type {string} Socket style */
	static socketStyle = '4,10,4,10';

	/** @type {*} Default value — fresh array created per-instance in constructor */
	static defaultValue = null;

	/** @type {(value: any) => boolean} */
	static validateFn = (v) => Array.isArray(v);

	/** @type {(value: any) => any} */
	static lintFn = (v) => Array.isArray(v) ? v : [];

	/** @type {(a: any, b: any) => boolean} */
	static compareFn = (a, b) => a?.length === b?.length;

	/** Whether the picker allows multiple files */
	static multiple = false;

	/** File type filter passed to the input's accept attribute */
	static accept = '*';

	/** Serialization mode: 'path' (default) or 'binary' */
	static serializeAs = 'path';


	/** Default constructor */
	constructor(value) {

		super(value);

		// Stamp params onto the class so the widget can read them
		this.static.multiple   = this.static.params?.multiple   ?? false;
		this.static.accept     = this.static.params?.accept     ?? '*';
		this.static.serializeAs = this.static.params?.serializeAs ?? 'path';

		// Always ensure a fresh array — never share static defaultValue across instances
		if (!Array.isArray(this.value)) {
			this.value = [];
		}
	}


	/**
	 * Serializes the file list according to the serializeAs param.
	 * Called by NWNode.serialize() when this VType instance has serializeValue().
	 *
	 * @param {Array} val - array of { name, path, data }
	 * @returns {Array}
	 */
	serializeValue(val) {
		if (!Array.isArray(val)) return [];
		return val.map(f => {
			if (this.static.serializeAs === 'binary') {
				return { name: f.name, path: f.path, data: f.data };
			}
			// 'path' mode — omit potentially large binary data
			return { name: f.name, path: f.path };
		});
	}


	/**
	 * Reconstructs the file list from serialized data.
	 * Called by NWNode.deserialize() when this VType instance has deserializeValue().
	 *
	 * @param {Array} data
	 * @returns {Array}
	 */
	deserializeValue(data) {
		if (!Array.isArray(data)) return [];
		return data.map(f => ({
			name: f.name || null,
			path: f.path || null,
			data: f.data || null,
		}));
	}


	// ---- Static factory methods ----

	/**
	 * Allow selecting multiple files at once.
	 * In multiple mode, each pick session appends to the existing list.
	 */
	static Multiple() {
		return this.addConstructorParam({ multiple: true });
	}

	/**
	 * Filter the file picker to specific file types.
	 * @param {string} filter - HTML accept string, e.g. '.pdf,.docx' or 'image/*'
	 */
	static Accept(filter) {
		return this.addConstructorParam({ accept: filter });
	}

	/**
	 * Serialize file contents as base64 binary.
	 * Files are read at pick time and stored in the 'data' field.
	 * Useful for small embedded assets; avoid for large files.
	 */
	static AsBinary() {
		return this.addConstructorParam({ serializeAs: 'binary' });
	}
}
