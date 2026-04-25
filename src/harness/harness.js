/*
	harness.js
	----------

	Mount entry for the test harness. Consumer-shape: imports come from
	the package name `vue3-node-widgets` (resolved pre-publish via vite alias
	to ./src/index.js).

	The harness is the canonical reference example for shader-style consumers —
	if it works here, it'll work after `npm install vue3-node-widgets`.
*/

// Vue + bootstrap CSS that the library components rely on
import { createApp } from 'vue';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

// Local harness shell + global styles (these are NOT part of the library)
import HarnessApp from './HarnessApp.vue';
import '../assets/style.css';

createApp(HarnessApp).mount('#app');
