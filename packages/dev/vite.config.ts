import { slidemd } from '@slidemd/slidemd'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		svelte({
			extensions: ['.svelte', '.md'],
			preprocess: [slidemd({ extension: '.md' })]
		})
	]
})
