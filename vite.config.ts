import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'
import tsconfigPaths from 'vite-tsconfig-paths'
import sveltePreprocess from 'svelte-preprocess'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		svelte({
			preprocess: sveltePreprocess()
		}),
		tsconfigPaths(),
		crx({ manifest: manifest as ManifestV3Export })
	]
})
