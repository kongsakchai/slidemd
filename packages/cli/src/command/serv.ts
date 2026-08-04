import { createSlideLoader } from '@/plugin/loader'

import { slidemd } from '@slidemd/slidemd'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

import type { InlineConfig } from 'vite'
import { createServer as createViteServer, searchForWorkspaceRoot } from 'vite'

interface Options {
	port: number
}

export async function createServer(root: string, opt?: Options) {
	const inlineConfig: InlineConfig = {
		configFile: false,
		plugins: [
			createSlideLoader(root),
			tailwindcss(),
			svelte({
				extensions: ['.svelte', '.md'],
				preprocess: [slidemd({ extension: '.md' }), vitePreprocess()]
			})
		],
		server: {
			port: opt?.port,
			strictPort: opt?.port !== undefined,
			fs: { allow: [searchForWorkspaceRoot(process.cwd()), root] }
		},
		logLevel: 'error',
		clearScreen: false
	}

	const server = await createViteServer(inlineConfig)
	await server.listen()

	const resolved = server.resolvedUrls?.local[0] ?? `http://localhost:${server.config.server.port}`
	console.log(resolved)
	return server
}
