<!--
	NVColor4Widget.vue
	-------------------

	This will be the component used to display the NVColor4 type in the node UI.
	(i.e. has alpha channel)
-->
<template>

	<div 
		class="n-color4-widget" 
		:class="{
			'read-only': readOnly,
		}"
		:style="{
			'text-align': align,
			'--hex-color': hexValue,
		}"
	>
		<!-- the outer most wrapper -->
		<div class="input-wrapper">

			<!-- by default show value & click to enable the input -->
			<div class="number-value-row">

				<div class="color-rgb-wrapper">

					<div class="r">
						<NumberInput 
							v-model="colorR"
							:lint="lintFloat"
							:validate="validateFloat"
							:min="0"
							:max="1"
							:step="0.01"
							round="top-left"
							:formatFn="f => `r:${f}`"
							:read-only="readOnly"
						/>
					</div>

					<div class="g">
						<NumberInput 
							v-model="colorG"
							:lint="lintFloat"
							:validate="validateFloat"
							:min="0"
							:max="1"
							:step="0.01"
							border="0px 0px 0px 2px"
							round="neither"
							:formatFn="f => `g:${f}`"
							:read-only="readOnly"
						/>
					</div>

					<div class="b">
						<NumberInput 
							v-model="colorB"
							:lint="lintFloat"
							:validate="validateFloat"
							:min="0"
							:max="1"
							:step="0.01"
							border="0px 0px 0px 2px"
							round="neither"
							:formatFn="f => `b:${f}`"
							:read-only="readOnly"
						/>
					</div>

					<div class="a">
						<NumberInput 
							v-model="colorA"
							:lint="lintFloat"
							:validate="validateFloat"
							:min="0"
							:max="1"
							:step="0.01"
							border="0px 0px 0px 2px"
							round="top-right"
							:formatFn="f => `a:${f}`"
							:read-only="readOnly"
						/>
					</div>

				</div>

				<!-- text and color-picker row -->
				<div class="color-picker-row">

					<TextInput 
						ref="hexEditEl"
						class="hex-input"
						v-model="hexValue"
						@update:modelValue="hexValue = $event"
						round="bottom-left"
						:lint="lintHex"
						:validate="validateHex"
						:read-only="readOnly"
					/>

					<div class="color-input-wrapper">
						<input 
							type="color"
							:style="{
								opacity: colorA,
							}"
							v-model="colorInputHexValue"
							:disabled="readOnly"
						/>
					</div>
				</div>

			</div>

		</div>

	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch } from 'vue';

// components
import Toggle from '../MiscWidgets/Toggle.vue';
import NumberInput from '../MiscWidgets/NumberInput.vue';
import TextInput from '../MiscWidgets/TextInput.vue';

// types + misc
import { VNumber } from '@/classes/Types';
import { colord } from "colord";

// props
const props = defineProps({

	// the node this widget is for
	node: {
		type: Object,
		required: true
	},

	// the field this widget is for
	field: {
		type: Object,
		required: true
	},

	// the alignment of the label text
	align: {
		type: String,
		default: 'left'
	},
	
	// true when read only
	readOnly: {
		type: Boolean,
		default: false
	},
});

const hexEditEl = ref(null);


const valueRef = props.node.fieldState[props.field.name].valueRef;

const colorR = computed({
	get() { return valueRef.value.r; },
	set(newVal) {
		valueRef.value = { ...valueRef.value, r: newVal,}
	}
});
const colorG = computed({
	get() { return valueRef.value.g; },
	set(newVal) {
		valueRef.value = {...valueRef.value, g: newVal}
	}
});
const colorB = computed({
	get() { return valueRef.value.b; },
	set(newVal) {
		valueRef.value = {...valueRef.value, b: newVal}
	}
});
const colorA = computed({
	get() { return valueRef.value.a; },
	set(newVal) {
		valueRef.value = {...valueRef.value, a: newVal}
	}
});


watch([colorR, colorG, colorB, colorA], ([nr, ng, nb, na], [or, og, ob, oa]) => {

	// prevent watcher loop if values are the same
	if (nr === or && ng === og && nb === ob && na == oa) return;

	if(hexEditEl.value.inputEnabled==true){
		// console.log('not updating hex value because input is enabled');
		return;
	}

	// update the hex value whenever the RGB values change
	hexValue.value = rgbaToHex(nr, ng, nb, na);
	colorInputHexValue.value = hexValue.value.slice(0, -2); 
	
});



// using colord convert floating point r-g-b-values to hex
/**
 * Converts RGBA floats (0–1) to HEX color string with alpha.
 * @param {number} r - Red channel (0 to 1)
 * @param {number} g - Green channel (0 to 1)
 * @param {number} b - Blue channel (0 to 1)
 * @param {number} a - Alpha channel (0 to 1)
 * @returns {string} Hex color string with alpha (e.g. "#ff7e00cc")
 */
 function rgbaToHex(r, g, b, a = 1) {
	// Convert 0–1 floats to 0–255 integers
	const R = Math.round(r * 255);
	const G = Math.round(g * 255);
	const B = Math.round(b * 255);
	const A = a;

	// Use colord to convert to hex including alpha
	let hexStr = colord({ r: R, g: G, b: B, a: A }).toHex(); 

	// if alpha is 1, colorDoes not include it, so we add it manually
	if(A>=1)
		hexStr += "ff";
	
	return hexStr;
 }


/**
 * Converts a hex color string to an object with r, g, b, a properties (0–1 floats).
 *
 * Supports:
 * - #RGB
 * - #RGBA
 * - #RRGGBB
 * - #RRGGBBAA
 *
 * @param {string} hex - Hex color string (e.g. "#ff7e00cc")
 * @returns {Object|null} { r, g, b, a } or null if invalid
 */
 function hexToRgbaFloat(hex) {
	if (typeof hex !== "string") return null;

	// Normalize input
	let cleaned = hex.trim().replace(/^#/, "");

	// Expand shorthand (#RGB or #RGBA)
	if (cleaned.length === 3 || cleaned.length === 4) {
	cleaned = cleaned
		.split("")
		.map((ch) => ch + ch)
		.join("");
	}

	// Must be 6 (RGB) or 8 (RGBA) hex digits now
	if (!/^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(cleaned)) {
	return null;
	}

	// Extract RGB
	const r = parseInt(cleaned.slice(0, 2), 16) / 255;
	const g = parseInt(cleaned.slice(2, 4), 16) / 255;
	const b = parseInt(cleaned.slice(4, 6), 16) / 255;

	// Extract Alpha if present, otherwise default to 1
	const a = cleaned.length === 8 ? parseInt(cleaned.slice(6, 8), 16) / 255 : 1;
	
	return { r, g, b, a };
}


// we'll use a local variable to store the hex equivalent of the color
// and allow the user to type hex, but internally we'll
// always convert and store to floating-point r-g-b-values
const hexValue = ref(rgbaToHex(colorR.value, colorG.value, colorB.value, colorA.value));

// for color 4, we need a separate variable to use with the color input because
// the color input does not support alpha channel
// chop off the last two characters (alpha) from the hex value
const hexValueWithoutAlpha = computed(() => {
	return hexValue.value.slice(0, -2);
});
const colorInputHexValue = ref(hexValueWithoutAlpha.value);

watch(() => colorInputHexValue.value, (newVal, oldVal) => {

	// If it's not a valid hex color, revert to the old value & GTFO
	if (!colord(newVal).isValid()) {
		// console.warn(`Invalid hex color: ${newVal}`);
		hexValue.value = oldVal;
		return;
	}

	// prevent watcher loop if values are the same
	if (newVal === oldVal) return;

	// Convert hex to RGB floats
	const rgb = hexToRgbaFloat(newVal);
	if (rgb) {
		colorR.value = rgb.r;
		colorG.value = rgb.g;
		colorB.value = rgb.b;
	} else {
		// console.warn(`Failed to convert hex to RGB: ${newVal}`);
	}
});

// Validate whenever hexValue changes
watch(() => hexValue.value, (newVal, oldVal) => {

	// If it's not a valid hex color, revert to the old value & GTFO
	if (!colord(newVal).isValid()) {
		// console.warn(`Invalid hex color: ${newVal}`);
		hexValue.value = oldVal;
		return;
	}

	// prevent watcher loop if values are the same
	if (newVal === oldVal) return;

	colorInputHexValue.value = newVal.slice(0, -2);

	// Convert hex to RGB floats
	const rgb = hexToRgbaFloat(newVal);
	if (rgb) {
		colorR.value = rgb.r;
		colorG.value = rgb.g;
		colorB.value = rgb.b;
		colorA.value = rgb.a !== undefined ? rgb.a : 1; 
	} else {
		// console.warn(`Failed to convert hex to RGB: ${newVal}`);
	}

});


/**
 * Lints a float value to ensure it's between 0.0 and 1.0.
 * @param value - The value to lint
 * @returns {number} The linted value
 */
const lintFloat = (value)=>{

	// ensure it's between 0 and 1
	value = VNumber.lint(value);
	value = Math.max(0, Math.min(1, parseFloat(value))); 
	return value;
};


/**
 * Validates a float value to ensure it's between 0.0 and 1.0.	
 * @param value - The value to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateFloat = (value)=>{

	if( isNaN(value) || value === null || value === undefined ) {
		return false;
	}
	if( value < 0 || value > 1 ) {
		return false;
	}
	return VNumber.validate(value);
}


/**
 * Lints a hex value to ensure it's in the proper format.
 * 
 * @param v - The hex value to lint
 * @return {string} The linted hex value
 */
function lintHex(v) {
	if (typeof v !== "string") return "#000000";

	// Normalize value: trim and lowercase
	const trimmed = v.trim().toLowerCase();

	// Try to parse with colord
	const c = colord(trimmed);

	// If valid, return the properly formatted hex
	if (c.isValid()) {
		return c.toHex(); // always returns 7-char hex like "#aabbcc"
	}

	// If not valid, return the original (or optionally "#000000")
	return trimmed;
}


/**
 * Validates a hex color string.
 * 
 * @param v - The hex value to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateHex(v) {

	// check if its a string and has at least 9 characters (including #)
	if( typeof v !== "string" ) return false;
	if( v.length < 9 ) return false;

	return colord(v).isValid();
}


</script>
<style lang="scss" scoped>

	.n-color4-widget {
		
		.input-wrapper {
			
			.number-value-row {

				// so we can position children abso-lutely
				position: relative;

				// for debug
				// border: 1px solid blue;
				padding: 0em 0em 3em 0em;

				// text alignment
				text-align: var(--align, left);

				// box around the three inputs
				.color-rgb-wrapper {
					width: 100%;
					height: calc(18em + 1px);
					border-bottom: 2px solid black;
					overflow: clip;

					display: flex;
					.r, .g, .b, .a {
						width: 25%;
					}
				}// .color-rgb-wrapper

				// below the R:G:B boxes, we'll have a #hex input & a regular ol color picker
				.color-picker-row {

					display: flex;

					.hex-input {
						width: 50%;						
					}

					.color-input-wrapper {

						position: relative;

						width: 50%;
						background: 
 							repeating-conic-gradient(#808080 0 25%, #0000 0 50%) 
      						50% / 20px 20px;

						border-left: 2px solid black;
						border-radius: 0em 0em 10em 0em;

						overflow: clip;

						input {
							position: absolute;
							inset: -10px -10px -10px -10px;
							width: calc(100% + 20px);
							height: calc(100% + 20px);

						}

					}// .color-input-wrapper

				}// .color-picker-row
				
			}// .number-value-row

		}// .input-wrapper

		&.read-only {

			input {
				cursor: not-allowed !important;
			}

		}// .read-only

	}// .n-color4-widget

</style>
