import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueDevTools(),
	],
	build: {
		// Preserve class names so serialization key lookup by constructor.name
		// works correctly in minified production builds.
		// The explicit serializeKey on each node class is the primary lookup,
		// but this ensures fallback behavior stays intact too.
		minify: 'esbuild',
	},
	esbuild: {
		keepNames: true,
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@src': fileURLToPath(new URL('./src', import.meta.url)),
			'@Components': fileURLToPath(new URL('./src/components', import.meta.url)),
			'@Composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
			'@Assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
			'@Classes': fileURLToPath(new URL('./src/classes', import.meta.url)),
			'@Nodes': fileURLToPath(new URL('./src/classes/Nodes', import.meta.url)),
			'@Types': fileURLToPath(new URL('./src/classes/Types', import.meta.url)),

			// Pre-publish: the test harness imports from 'vue3-node-widgets' so its
			// integration code reads identically to what consumers will write after
			// `npm install vue3-node-widgets`. After publish, this alias is irrelevant
			// for consumers — they hit the package via node_modules. We keep it here
			// so the harness can be developed against the public-API barrel without
			// any import-path differences.
			'vue3-node-widgets': fileURLToPath(new URL('./src/index.js', import.meta.url)),
		},
	},
});
