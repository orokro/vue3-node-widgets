<!--
	SuperWaveNode.vue
	-----------------

	This is a component to demonstrate a custom node type that has completely custom UI.

	So, it wont generate the default field-type UI, and instead, handles 100% of it's own rendering.
-->
<template>

	<div class="super-wave-node">

		asd
	</div>
</template>
<script setup>

// vue
import { ref, onMounted, computed, shallowRef, watch, inject } from 'vue';

// props
const props = defineProps({

	// reference to the NWEditor instance
	nwSystem: {
		type: Object,
		required: true
	},

	// the node instance 
	node: {
		type: Object,
		required: true
	}

});


// set our socket positions when mounted
onMounted(() => {

	setSocketPositions();

});


function setSocketPositions(){

	const node = props.node;

	// input side
	node.fieldState.theta.data.inputYPos.value = 20;
	node.fieldState.amplitude.data.inputYPos.value = 172;
	node.fieldState.wavelength.data.inputYPos.value = 196;

	// output side
	node.fieldState.result.data.outputYPos.value = 20;
}

</script>
<style lang="scss" scoped>

	.super-wave-node{

		// for debug
		/* border: 1px solid red; */

		// fixed size
		width: 322em;
		height: 245em;

		// background image
		background: url('/SuperWave/base_image.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;

	}// .super-wave-node
	
</style>
