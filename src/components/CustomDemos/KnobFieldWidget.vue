<!--
	KnobFieldWidget.vue
	-------------------

	This will show a knob to modify a number field.

	This is to demonstrate the custom field widget system.
-->
<template>

	<div 
		class="n-number-knob-widget" 
		:class="{
			'read-only': readOnly,
		}"
		:style="{
			'text-align': align,
		}"
	>
		<div class="input-wrapper">

			<!-- min indicator label -->
			<div class="min-lbl lbl"><span>0&bull;</span></div>
			
			<!-- box to center the knob -->
			<div class="knob-box">

				<!-- the actual knob that rotates -->
				<div 
					class="knob"
					:style="{
						transform: `rotate(${knobAngle}deg)`,
						cursor: readOnly ? 'default' : 'ew-resize',
					}"
					@mousedown="startKnobDrag"
				>
					<div 
						class="knob-value"
						:style="{
							transform: 'translate(-50%, -50%) rotate(' + (-knobAngle) + 'deg)',
						}"
					
					><span>{{ numberValue }}</span></div>	
					<div class="knob-indicator"></div>
				</div>
			</div>

			<!-- max indicator label -->
			<div class="max-lbl lbl"><span>&bull;100</span></div>

		</div>
	</div>

</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch, inject } from 'vue';

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


// get our reusable drag helper
const dh = inject('dh');

// we'll store the editable value here & run our state logic on it
const numberValue = props.node.fieldState[props.field.name].valueRef;


// compute the angle for the CSS based on our value
const knobAngle = computed(()=>{
	return -125 + (numberValue.value / 100) * 250;
});


/**
 * Handle the start of a knob drag
 * @param e - mouse event
 */
function startKnobDrag(e){

	// get initial value
	const startValue = numberValue.value;

	// start drag
	dh.dragStart(
		(dx, dy)=>{

			// if read only, gtfo
			if(props.readOnly)
				return;

			// calculate new value
			let newValue = startValue - dx;

			// lint it
			newValue = lint(newValue);

			// set it
			numberValue.value = newValue;

		},
		(dx, dy) => {

			// // on drag end, validate the value
			// if(!validate(numberValue.value)){
			// 	// if not valid, reset to start value
			// 	numberValue.value = startValue;
			// }

		},
	);
}

onMounted(() => {

	console.log("Mounted Knob", numberValue.value);

	// console.log("NVNumberWidget mounted");
	// console.log("node", props.node);
	// console.log("field", props.field);
	// console.log("align", props.align);
	// console.log("readOnly", props.readOnly);
});



const lint = (value)=>{

	const valueType = props.field.valueType;
	// both the type itself has a lint fn,
	// as well as field itself.
	// run both:
	value = valueType.lint(value);
	value = props.field.lintFn(value);

	const min = valueType.min || 0;
	const max = valueType.max || 100;

	// if the value type has a min/max apply them
	if(min!==undefined && min!==null)
		value = Math.max(value, min);
	if(max!==undefined && max!==null)
		value = Math.min(value, max);

	return value;
};


const validate = (value)=>{

	// both the type itself has a validate fn,
	// as well as field itself.
	// run both:
	return props.field.valueType.validate(value) && props.field.validateFn(value);
}

</script>
<style lang="scss" scoped>

	.n-number-knob-widget {
		
		// main wide wrapper
		.input-wrapper {
			
			// for debug
			/* border: 1em solid red; */
			
			// flex to aligning children dead center
			display: flex;
			justify-content: center;
			align-items: end;
			flex-direction: row;

			// the labels on either side
			.lbl {

				// for debug
				/* border: 1px solid green; */

				// smaller than the full knob box
				height: 20em;
				width: 20em;

				// text styles
				span { font-size: 18em; }
				text-align: center;
				
			}// .lbl

			// box containing the knob
			.knob-box {

				// for debug
				/* border: 1px solid blue; */

				// actual knob
				.knob {

					// for absolute positioning of the indicator
					position: relative;

					// nice circle
					width: 60em;
					height: 60em;
					border: 2em solid var(--nw-node-input-separator-color);
					border-radius: 50%;
					background: var(--nw-node-input-accent1);
					margin: 4em;

					// look draggable
					cursor: ew-resize;

					// rotates around center
					transform-origin: center center;

					// shows value of knob in center
					.knob-value {
						
						// center
						position: absolute;
						top: 50%;
						left: 50%;

						// text settings
						span { font-size: 14em; }
						font-weight: bolder;
						font-family: monospace;
						color: var(--nw-node-input-text-color);

						// nice bg
						background: var(--nw-node-input-b-g-color);
						padding: 0em 4em 1em;
						border-radius: 3em;

					}// .knob-value

					// the value indicator
					.knob-indicator {

						// not interactable
						pointer-events: none;

						// for debug
						/* border: 1px solid purple; */

						// small line sticking out of the knob
						width: 6em;
						height: 16em;
						background: var(--nw-node-input-separator-color);
						border-radius: 5em;

						// position it in the center top of the knob
						position: absolute;
						top: -6em;
						left: 50%;
						transform: translateX(-50%);

					}// .knob-indicator

				}// knob
				
			}// .knob-box

		}// .input-wrapper

	}// .n-number-knob-widget

</style>
