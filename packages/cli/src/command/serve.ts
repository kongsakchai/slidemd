import { config } from '@/config'
import { getMarkdowns, readMarkdown } from '@/contents'
import { TemplateOptions, templateApp, templateSlide, templateSlideLayout } from '@/templates'
import { makeMap, resolveSlideId, resolveSlideLayoutId } from '@/utils'

import { generateAppHtml } from '@html'
import { slidemd } from '@slidemd/slidemd'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

import path from 'path'
import type { InlineConfig, Plugin } from 'vite'
import { createServer as createViteServer } from 'vite'

function slidemdPlugin(root: string): Plugin {
	const { markdowns } = getMarkdowns(root)
	const slideyouts = makeMap(markdowns, resolveSlideLayoutId, resolveSlideId)
	const slides = makeMap(markdowns, resolveSlideId, (v) => v)

	const option: TemplateOptions = {
		root,
		markdowns,
		themes: [],
		getSlideId(this, layoutId) {
			return slideyouts[layoutId]
		},
		read(this, slideId) {
			return readMarkdown(path.join(this.root, slides[slideId])) || ''
		}
	}

	const modules = [
		templateApp,
		...markdowns.flatMap((m) => [
			{ ...templateSlideLayout, id: resolveSlideLayoutId(m) },
			{ ...templateSlide, id: resolveSlideId(m) }
		])
	]

	const getModule = (id: string) => {
		const find = modules.find((m) => m.id === id)
		return find
	}

	const indexHtml = generateAppHtml(templateApp.id)

	return {
		name: 'slidemd-dev',
		resolveId(id) {
			return getModule(id)?.id
		},
		async load(id) {
			return getModule(id)?.getContent(option)
		},
		configureServer(server) {
			server.middlewares.use(async (req, resp, next) => {
				const url = req.url || '/'

				let html = ''
				if (url === '/') {
					html = await server.transformIndexHtml(url, indexHtml)
				} else if (url.endsWith('.md')) {
					const module = resolveSlideLayoutId(url)
					html = await server.transformIndexHtml(url, generateAppHtml(module))
				}

				if (html) {
					resp.setHeader('Content-Type', 'text/html; charset=utf-8')
					resp.statusCode = 200
					resp.end(html)
					return
				}

				next()
			})
		}
	}
}

export async function createServer(src: string) {
	const inlineConfig: InlineConfig = {
		configFile: false,
		plugins: [
			tailwindcss(),
			slidemdPlugin(src),
			svelte({
				extensions: ['.svelte', config.suffix],
				preprocess: [slidemd({ extension: config.suffix }), vitePreprocess()]
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
