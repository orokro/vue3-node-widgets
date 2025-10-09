<!--
	NWStyle.vue
	-----------
	Component to manage themes for the NWGraphEditor

	This component:
	1. Merges user-provided theme with defaults.
	2. Dynamically generates scoped CSS variables inside a <style> tag.
	3. Provides the reactive merged theme via provide('nw-theme').
	4. Automatically assigns a unique data-theme-id for scoping.
	5. Keeps all styling encapsulated within the component's DOM.
-->
<template>
	<!--
		Wrapper for slot content.
		The style tag is inserted inside this component,
		and all descendants automatically inherit its CSS vars.
	-->
	<div ref="mountPoint" :data-theme-id="themeId" style="display: contents;">
		<slot/>
	</div>
</template>
<script setup>


// ----------------------------
// Imports
// ----------------------------
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue';

// ----------------------------
// Props
// ----------------------------
const props = defineProps({

	/** User-supplied theme object */
	theme: {
		type: Object,
		default: () => ({})
	}
});


// ----------------------------
// Default Theme
// ----------------------------
/**
 * @constant {Object} defaultTheme
 * @description Built-in default theme configuration for NWGraphEditor.
 * Each key corresponds to either a CSS visual property or a JS-only setting.
 */
const defaultTheme = {

	// graph settings

	// background color of the graph body
	graphBGColor: '#3C3C3C',

	// url to image note: not CSS "url('asd')" type property. This will be a raw URL string, that should be converted to appropriate CSS
	graphBGImage: '/img/grid_bg.png',

	// node settings

	// color to use for node outline
	nodeOutlineColor: '#000000',

	// color to use for selected nodes
	nodeOutlineColorSelected: '#00ABAE',

	// TL TR BR BL, except numbers only, no units, internally converted to EM
	nodeBorderRadius: '10 10 10 10',

	// background color of node by default
	nodeBodyBGColor: '#AFAFAF',

	// default font color for contents of a node
	nodeTextColor: '#000000',

	// node title bar settings

	// background color for the title bar of nodes
	nodeTitleBGColor: '#1E1E1E',

	// text color for title bar
	nodeTitleTextColor: '#FFFFFF',

	// delete button rest color
	nodeTitleDeleteButtonColor: '#000000',

	// delete button hover color
	nodeTitleDeleteButtonColorHover: '#9A0E0E',

	// delete button text icon color
	nodeTitleDeleteButtonFGColor: '#FFFFFF',

	// collapse button rest color
	nodeTitleCollapseButtonBGColor: '#000000',

	// hover color when open
	nodeTitleCollapseButtonOpenHoverColor: '#9A5E0E',

	// hover color when closed
	nodeTitleCollapseButtonClosedColor: '#2F9A0E',

	// collapse button text icon color
	nodeTitleCollapseButtonFGColor: '#FFFFFF',

	// node field colors
	nodeFieldTextColor: '#000000',

	// node inputs colors

	// default background color for inputs
	nodeInputBGColor: '#808080',

	// accent color 1 (used for range & toggles)
	nodeInputAccent1: '#595959',

	// accent color 2 (used or enabled toggles & arrow widgets_)
	nodeInputAccent2: '#C0C0C0',

	// default text color
	nodeInputTextColor: '#FFFFFF',

	// interactive input bg color
	nodeInputBGColorActive: '#EFEFEF',

	// interactive input text color
	nodeInputTextColorActive: '#000000',

	// used for separators on nodes 
	nodeInputSeparatorColor: '#000000',

	// wire settings

	// color for wires between nodes
	// NOTE: in future this may be automatically determined from socket type
	wireColor: '#FFFFFF',

	// thiccness for wires
	wireWidth: '2'
};


// ----------------------------
// Internal State
// ----------------------------

// the ref to where we'll append the style tag & the style element
const mountPoint = ref(null);
const styleEl = document.createElement('style');

// unique identifier for theme scoping
const themeId = `nw-theme-${Math.random().toString(36).slice(2, 9)}`;


// ----------------------------
// Merged Theme (reactive)
// ----------------------------
const mergedTheme = computed(() => ({
	...defaultTheme,
	...props.theme
}));

// Provide to descendants for runtime (non-CSS) usage
provide('nw-theme', mergedTheme);


// ----------------------------
// CSS Generation
// ----------------------------

/**
 * Converts camelCase or PascalCase keys to kebab-case CSS variable names.
 * @param {string} key 
 * @returns {string}
 */
function toKebab(key) {
	return key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}


/**
 * Builds the CSS text from the merged theme.
 * Converts eligible values to CSS variables.
 * @returns {string}
 */
function generateCSS() {

	const entries = Object.entries(mergedTheme.value);
	let cssVars = '';

	for (const [key, value] of entries) {

		// only include string/number values that make sense as CSS
		// skip numeric-only values meant for JS (like wireWidth) if desired
		if (value === null || value === undefined)
			continue;

		// convert raw values to valid CSS
		let cssVal = value;

		// handle background images (convert to url())
		if (key === 'graphBGImage' && typeof value === 'string')
			cssVal = `url('${value}')`;

		// border radius needs to strip units and make sure units are em
		else if (key === 'nodeBorderRadius' && typeof value === 'string') {
			const parts = value.split(' ').map(v => v.trim().replace(/[^\d.-]/g, ''));
			if (parts.length === 1)
				cssVal = `${parts[0]}em`;
			else if (parts.length === 2)
				cssVal = `${parts[0]}em ${parts[1]}em`;
			else if (parts.length === 3)
				cssVal = `${parts[0]}em ${parts[1]}em ${parts[2]}em`;
			else if (parts.length === 4)
				cssVal = `${parts[0]}em ${parts[1]}em ${parts[2]}em ${parts[3]}em`;
			else
				continue; // invalid, skip
		}

		// append variable
		cssVars += `\t--nw-${toKebab(key)}: ${cssVal};\n`;

		// border radius should auto-generate an inner radius with first two values as 0em
		if (key === 'nodeBorderRadius') {
			const parts = cssVal.split(' ').map(v => v.trim().replace('em', ''));
			let innerParts = parts.map((p, index) => {
				if (index < 2) {
					return '0em'; // keep top-left and top-right as 0em
				}
				const num = parseFloat(p);
				if (isNaN(num) || num <= 0)
					return '0em';
				const innerNum = Math.max(0, num - 3); // subtract 3 but stop at 0
				return `${innerNum}em`;
			});
			cssVars += `\t--nw-${toKebab(key)}-inner: ${innerParts.join(' ')};\n`;
		}

	}// next [key, value]

	// final CSS block scoped by theme ID
	return `[data-theme-id="${themeId}"] {\n${cssVars}}\n`;
}


// ----------------------------
// Watcher
// ----------------------------
// Re-generate CSS whenever theme changes
watch(mergedTheme, () => {
	
	styleEl.textContent = generateCSS();

}, { immediate: true, deep: true });


// ----------------------------
// Lifecycle
// ----------------------------
onMounted(() => {
	mountPoint.value.appendChild(styleEl);
});

onUnmounted(() => {
	styleEl.remove();
});

</script>
<style lang="scss">
	/* 
		No visual styles here; this component only injects variables.
		All descendants (like NWGraphEditor) can use the CSS vars via:
			color: var(--nw-node-text-color);
			background-color: var(--nw-graph-bg-color);
	*/
</style>
