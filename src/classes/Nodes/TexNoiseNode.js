/*
	TexNoiseNode.js
	---------------

	So this node is a bit more specific than others.
	Part of this project will be to provide a demo for rendering graphics on a canvas.
	I will be recreating a project from 2014.

	This will generate a perlin noise texture for painting
*/

import NWNode from '../NWNode.js';
import { NODE_TYPE, FIELD_TYPE } from '../NWNode.js';
import { 
	VAngle,
	VAngles,
	VBoolean,
	VCharacter,
	VColor3,
	VColor4,
	VInteger,
	VNumber,
	VText,
	VVector2,
	VVector3,
	VEnum,
 } from '../Types/index.js';
 
// main export
export default class TexNoise extends NWNode {

	// static properties for the class
	static nodeName = 'Noise Pattern';
	static icon = 'texture';

	static {

		// reset things
		this.init();
		
		// set this before adding fields
		this.setNodeType(NODE_TYPE.PROCESSING);

		this.addField(FIELD_TYPE.INPUT, { 
			name: 'scale',
			title: 'Scale', 
			description: "X is width, Y is height",
			type: VNumber.Min(1).Max(500)
		});	

		this.addField(FIELD_TYPE.INPUT, {
			name: 'octaves',
			title: 'Octaves', 
			description: "Number of layers of noise for fractal detail",
			type: VInteger.Min(1).Max(10)
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'persistence',
			title: 'Persistence', 
			description: "How much amplitude diminishes per octave (0.0-1.0)",
			type: VNumber.Min(0).Max(1)
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'lacunarity',
			title: 'Lacunarity', 
			description: "Frequency multiplier per octave (>1.0 for more detail)",
			type: VNumber.Min(1).Max(4)
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'contrast',
			title: 'Contrast', 
			description: "Adjusts contrast of final output",
			type: VNumber.Min(0).Max(5)
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'brightness',
			title: 'Brightness', 
			description: "Shifts output up or down",
			type: VNumber.Min(-1).Max(1)
		});

		this.addField(FIELD_TYPE.INPUT, {
			name: 'seed',
			title: 'Seed', 
			description: "Integer seed for reproducible randomness",
			type: VInteger
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'value',
			title: 'Value', 
			description: "Scalar value of noise at pixel coordinates",
			type: VNumber
		});

		this.addField(FIELD_TYPE.OUTPUT, {
			name: 'color',
			title: 'Color', 
			description: "Noise value as color (grayscale)",
			type: VColor3
		});
	}
	

	/**
	 * Constructor
	 */
	constructor() {
		super();

		this.fieldState.scale.val = 50.0;
		this.fieldState.octaves.val = 4;
		this.fieldState.persistence.val = 0.5;
		this.fieldState.lacunarity.val = 2.0;
		this.fieldState.contrast.val = 1.0;
		this.fieldState.brightness.val = 0.0;
		this.fieldState.seed.val = 0;		
	}


	// Simple Perlin Noise implementation adapted for artist-friendly parameters
	// ----------------------------------------------------------
	// PARAMETERS (suggested defaults):
	// scale:        Controls how "zoomed in" the noise is (default 50.0)
	// octaves:      Number of layers of noise for fractal detail (default 4)
	// persistence:  How much amplitude diminishes per octave (0.0-1.0) (default 0.5)
	// lacunarity:   Frequency multiplier per octave (>1.0 for more detail) (default 2.0)
	// contrast:     Adjusts contrast of final output (default 1.0)
	// brightness:   Shifts output up or down (default 0.0)
	// seed:         Integer seed for reproducible randomness (default 0)
	getPerlinPixel(x, y, {
			scale = 50.0,
			octaves = 4,
			persistence = 0.5,
			lacunarity = 2.0,
			contrast = 1.0,
			brightness = 0.0,
			seed = 0
		} = {})
	{
		
		// -------------------------------
		// Internal helper: fade function
		// Smooth interpolation curve used in Perlin noise
		function fade(t) {
			return t * t * t * (t * (t * 6 - 15) + 10);
		}

		// Internal helper: linear interpolation
		function lerp(a, b, t) {
			return a + t * (b - a);
		}

		// Internal helper: gradient function
		// Determines dot product of random gradient with distance vector
		function grad(hash, x, y) {
			const h = hash & 3;	// pick one of 4 directions
			const u = h < 2 ? x : y;
			const v = h < 2 ? y : x;
			return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
		}

		// -------------------------------
		// Pseudo-random permutation table (seeded)
		const p = new Uint8Array(512);
		const perm = new Uint8Array(256);
		
		function seededRandom(seed) {
			let t = Math.sin(seed++) * 10000;
			return t - Math.floor(t);
		}

		for (let i = 0; i < 256; i++) {
			perm[i] = i;
		}

		// Fisher-Yates shuffle based on seed
		for (let i = 255; i > 0; i--) {
			const j = Math.floor(seededRandom(seed + i) * (i + 1));
			[perm[i], perm[j]] = [perm[j], perm[i]];
		}

		for (let i = 0; i < 512; i++) {
			p[i] = perm[i & 255];
		}

		// -------------------------------
		// Core Perlin noise function
		function perlin2d(x, y) {
			// Find unit grid cell containing point
			const X = Math.floor(x) & 255;
			const Y = Math.floor(y) & 255;

			// Relative x, y within cell
			x -= Math.floor(x);
			y -= Math.floor(y);

			// Compute fade curves for x, y
			const u = fade(x);
			const v = fade(y);

			// Hash coordinates of the square's corners
			const aa = p[p[X] + Y];
			const ab = p[p[X] + Y + 1];
			const ba = p[p[X + 1] + Y];
			const bb = p[p[X + 1] + Y + 1];

			// Add blended results from the four corners
			const res = lerp(
				lerp(grad(aa, x, y), grad(ba, x - 1, y), u),
				lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u),
				v
			);
			return (res + 1) / 2; // map from [-1, 1] to [0, 1]
		}

		// -------------------------------
		// Fractal sum of octaves
		let amplitude = 1;
		let frequency = 1;
		let noiseValue = 0;
		let maxAmplitude = 0;

		for (let i = 0; i < octaves; i++) {
			const sampleX = (x / scale) * frequency;
			const sampleY = (y / scale) * frequency;

			const n = perlin2d(sampleX, sampleY);
			noiseValue += n * amplitude;
			maxAmplitude += amplitude;

			amplitude *= persistence; // reduces contribution of next octave
			frequency *= lacunarity;  // increases frequency for next octave
		}

		// Normalize result to 0-1
		noiseValue /= maxAmplitude;

		// Apply artistic post-processing
		// Contrast exaggerates differences from 0.5
		noiseValue = Math.pow(noiseValue - 0.5, contrast) + 0.5;

		// Apply brightness shift
		noiseValue = Math.min(Math.max(noiseValue + brightness, 0.0), 1.0);

		return noiseValue;
	}

}
