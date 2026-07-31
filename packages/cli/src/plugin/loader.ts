import { findMarkdowns, readMarkdown } from '@/content'
import { html404, renderAppHTML } from '@/html'
import { resolveLayoutId, resolveModule, virtualSlides } from '@/virtual'

import { existsSync, statSync } from 'node:fs'
import { ServerResponse } from 'node:http'
import { join } from 'node:path'
import type { Plugin } from 'vite'

export function createSlideLoader(root: string): Plugin {
	const markdowns = new Set(findMarkdowns(root))
	const ctx = { root, markdowns, read: readMarkdown }

	return {
		name: 'vite-slidemd',
		resolveId(id) {
			if (id.startsWith('@slide:')) return id
		},
		async load(id) {
			const mod = resolveModule(id)
			return await mod?.content.call({ ...ctx, id })
		},
		configureServer(server) {
			const respond = async (resp: ServerResponse, url: string, code: number, content: string) => {
				const html = await server.transformIndexHtml(url, content)
				resp.statusCode = code
				resp.setHeader('Content-Type', 'text/html; charset=utf-8')
				resp.end(html)
			}

			server.middlewares.use(async (req, res, next) => {
				const url = req.url?.split('?')[0] || '/'
				const absolute = join(root, url)

				if (!existsSync(absolute)) {
					return next()
				}

				if (statSync(absolute).isDirectory()) {
					return respond(res, url, 200, renderAppHTML(virtualSlides.id))
				}

				if (!absolute.endsWith('.md')) {
					req.url = join('/@fs/', absolute)
					return next()
				}

				const slideURL = url.slice(0, -3) // remove '.md'. don't parse page.md to slide
				const src = decodeURI(url.slice(1)) // remove first '/'
				if (!src || !markdowns.has(src)) {
					return respond(res, slideURL, 404, html404)
				}

				return respond(res, slideURL, 200, renderAppHTML(resolveLayoutId(src)))
			})
		}
	}
}
