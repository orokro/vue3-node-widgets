import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

/*
	vite.config.js
	--------------

	Two build targets share this config:

	  npm run dev        — serves the dev app (index.html) and harness (harness.html)
	                       on the same dev server. Both use the existing aliases,
	                       hot-reload, vue-devtools.
	  npm run build      — legacy app build (dist/ contains the dev-app SPA).
	                       Mostly kept around for sanity; not what gets published.
	  npm run build:lib  — library build. Produces dist/vue3-node-widgets.{js,cjs}
	                       and dist/style.css. THIS is what `npm publish` ships,
	                       gated by the `files` allowlist in package.json.

	The mode switch (`vite build --mode lib`) sets `mode === 'lib'` here.
*/

export default defineConfig(({ mode }) => {

	const isLib = mode === 'lib';

	return {

		plugins: [
			vue(),
			// vue-devtools is dev-only; keep it out of the library build to
			// avoid pulling its runtime into consumer bundles.
			...(isLib ? [] : [vueDevTools()]),
		],

		build: isLib ? {

			// ─── LIBRARY BUILD ───────────────────────────────────────────────
			//
			// Single entry barrel at src/index.js. Outputs both ESM and CJS so
			// modern bundlers and old Node CommonJS resolvers both work. CSS
			// is bundled to a single dist/style.css that consumers import as
			// `import 'vue3-node-widgets/style.css'` (resolved via the package
			// `exports` map in package.json).
			lib: {
				entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
				name: 'Vue3NodeWidgets',
				formats: ['es', 'cjs'],
				fileName: (format) => `vue3-node-widgets.${format === 'es' ? 'js' : 'cjs'}`,
			},
			rollupOptions: {

				// vue stays external — consumers bring their own. Everything else
				// (colord, gdraghelper, typical) gets bundled so the library is
				// self-contained.
				external: ['vue'],

				output: {
					globals: { vue: 'Vue' },

					// Predictable CSS filename so the package `exports` map can
					// expose it at a stable path.
					assetFileNames: (asset) => {
						if (asset.name && asset.name.endsWith('.css')) return 'style.css';
						return 'assets/[name]-[hash][extname]';
					},
				},
			},

			// Keep all CSS in one stylesheet rather than per-component splits —
			// consumers want a single import line for the library's styles.
			cssCodeSplit: false,

			sourcemap: true,
			emptyOutDir: true,
			outDir: 'dist',

		} : {

			// ─── DEV-APP BUILD (legacy) ──────────────────────────────────────
			//
			// Preserve class names so serialization key lookup by constructor.name
			// works correctly in minified production builds. The explicit
			// serializeKey on each node class is the primary lookup, but this
			// ensures fallback behavior stays intact too.
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
				//
				// IMPORTANT: this alias is ONLY for dev/harness. The library build
				// itself (mode === 'lib') ignores it because src/index.js doesn't
				// self-import the package name.
				'vue3-node-widgets': fileURLToPath(new URL('./src/index.js', import.meta.url)),
			},
		},
	};
});
