import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { join } from 'path'

const prerenderList = process.env.SLIDEMD_LIST ? process.env.SLIDEMD_LIST.split(',') : []

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
		prerender: {
			entries: ['/', ...prerenderList.map((v) => join('/view', v))]
		}
	}
}

export default config
