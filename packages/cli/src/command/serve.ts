import { findMarkdowns, readMarkdown } from '@/contents'
import { Context, Module, createMarkdown, createSlide, renderAppHTML, slideIndex } from '@/module'
import { rmMarkdownExtension } from '@/utils'

import { slidemd } from '@slidemd/slidemd'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

import { IncomingMessage, ServerResponse } from 'http'
import type { InlineConfig, Plugin } from 'vite'
import { createServer as createViteServer } from 'vite'

function slidemdPlugin(root: string): Plugin {
	const ctx: Context = {
		root,
		markdowns: findMarkdowns(root),
		read: readMarkdown
	}

	const routes = new Map<string, string>([['', slideIndex.id]])
	const modules = new Map<string, Module>([[slideIndex.id, slideIndex]])

	ctx.markdowns.forEach((md) => {
		const module = createSlide(md)
		const markdown = createMarkdown(md)
		routes.set(md, module.id)
		modules.set(module.id, module)
		modules.set(markdown.id, markdown)
	})

	return {
		name: 'slidemd-dev',
		resolveId(id) {
			if (modules.has(id)) return id
		},
		async load(id) {
			if (modules.has(id)) return modules.get(id)!.content(ctx)
		},
		configureServer(server) {
			const htmlResponse = async (url: string, module: string, resp: ServerResponse<IncomingMessage>) => {
				const html = await server.transformIndexHtml(rmMarkdownExtension(url), renderAppHTML(module))
				resp.setHeader('Content-Type', 'text/html; charset=utf-8')
				resp.statusCode = 200
				resp.end(html)
			}

			server.middlewares.use(async (req, resp, next) => {
				const url = req.url || '/'
				const isNavigate = req.headers['sec-fetch-dest'] === 'document'
				if (!isNavigate) return next()

				const moduleId = routes.get(url.replace(/^\//, '')) || ''
				console.log({ moduleId, url, routes })
				return htmlResponse(url, moduleId, resp)
			})
		}
	}
}

export async function createServer(src: string) {
	const inlineConfig: InlineConfig = {
		configFile: false,
		plugins: [
			slidemdPlugin(src),
			tailwindcss(),
			svelte({
				extensions: ['.svelte', '.md'],
				preprocess: [slidemd({ extension: '.md' }), vitePreprocess()]
			})
		],
		server: {
			strictPort: false,
			open: false,
			fs: {
				allow: [src]
			}
		},
		logLevel: 'warn',
		clearScreen: false
	}

	return await createViteServer(inlineConfig)
}
