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
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@Classes': fileURLToPath(new URL('./src/classes', import.meta.url)),
			'@Nodes': fileURLToPath(new URL('./src/classes/Nodes', import.meta.url)),
			'@Types': fileURLToPath(new URL('./src/classes/Types', import.meta.url)),
		},
	},
});
