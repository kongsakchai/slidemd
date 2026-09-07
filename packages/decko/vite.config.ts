import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

import path from 'node:path'
import { defineConfig } from 'vite'

import { decko } from './src/lib'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		svelte({
			extensions: ['.svelte', '.svelte.md'],
			preprocess: [decko(), vitePreprocess()]
		})
	],
	resolve: {
		alias: {
			'@decko/decko': path.resolve(__dirname, './src/lib')
		}
	}
})
