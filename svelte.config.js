import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { join } from 'path'

const prerenderList = process.env.SLIDEMD_LIST?.split(',') || []

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
		prerender: {
			entries: ['/', ...prerenderList.map((v) => join('/view', v))],
			handleHttpError: 'ignore'
		}
	},
	onwarn: (warning, handler) => {
		if (warning.code.includes('a11y')) return
		handler(warning)
	}
}

export default config
