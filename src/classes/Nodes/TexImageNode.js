/*
	TexImageNode.js
	---------------

	Samples pixel colors from a user-picked image file (VImage).

	The image value stores { name, path, dataUrl }. After the user picks a file
	the NVImageWidget decodes the image and attaches a cached pixel buffer:
	  { ...imageValue, pixelData: Uint8ClampedArray, pixelWidth, pixelHeight }

	This node tiles the image: coordinates wrap at image boundaries, so the
	image can be sampled at any integer pixel position.
*/

import NWNode from '../NWNode.js';
import { NODE_TYPE, FIELD_TYPE } from '../NWNode.js';
import {
	VColor3,
	VVector2,
} from '../Types/index.js';
import { VImage } from '../Types/VImage.js';

// main export
export default class TexImage extends NWNode {

	// static properties for the class
	static nodeName = 'Image Texture';
	static icon = 'texture';

	static {

		// reset things
		this.init();

		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		// Image picker — uses VImage so the user can browse for a file
		this.addField(FIELD_TYPE.INPUT, {
			name: 'image',
			title: 'Image',
			description: "The image to sample colors from. Tiles at image boundaries.",
			type: VImage,
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'posV2',
			title: 'Pixel X, Y as Vector2',
			description: "Pixel X and Y position to sample from the image",
			type: VVector2,
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'outColor',
			title: 'Output Color',
			description: "The color sampled from the image at the given position",
			type: VColor3
		});

		// Evaluation: look up pixel in the pre-cached pixel buffer.
		// pixelData is attached to the value by NVImageWidget after the user picks a file.
		// If no image or no pixel cache, output black.
		this.setEvalFunction((inputs) => {
			const img = inputs.image;
			if (!img?.pixelData || !img.pixelWidth || !img.pixelHeight) {
				return { outColor: { r: 0, g: 0, b: 0 } };
			}

			const { pixelData, pixelWidth, pixelHeight } = img;
			const px = inputs.posV2?.x ?? 0;
			const py = inputs.posV2?.y ?? 0;

			// Wrap (tile) coordinates so the image repeats infinitely
			const ix = ((Math.floor(px) % pixelWidth)  + pixelWidth)  % pixelWidth;
			const iy = ((Math.floor(py) % pixelHeight) + pixelHeight) % pixelHeight;

			const i = (iy * pixelWidth + ix) * 4;
			return {
				outColor: {
					r: pixelData[i]     / 255,
					g: pixelData[i + 1] / 255,
					b: pixelData[i + 2] / 255,
				}
			};
		});
	}

	/**
	 * Constructor
	 */
	constructor(...args) {
		super(...args);
	}

}
