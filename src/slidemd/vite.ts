import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { env } from 'process'
import type { Plugin, ViteDevServer } from 'vite'
import { extractFrontmatter, parseSlide } from './parser'
import type { Context, Markdown } from './types'
import * as virtual from './virtual'

const assetspath = path.resolve(env.SLIDEMD_PATH || 'src/examples')
const cachepath = path.resolve('.slidemd-cache')
const builtinpath = path.resolve('src/builtin')

const markdownFilter = (d: string) => /\.md$/.test(d) && !/^\.|\/\./.test(d)
const cssFilter = (d: string) => /\.css$/.test(d) && !/^\.|\/\./.test(d) && /^themes\//.test(d)
const resolvePath = (d: string) => path.join(assetspath, d)

export const slideMD = async (): Promise<Plugin> => {
	const builtinAssets = readdirSync(builtinpath, { recursive: true, encoding: 'utf-8' })
	const builtinCSS: string[] = builtinAssets.filter(cssFilter).map((src) => path.join(builtinpath, src))

	let assets: string[] = []
	let modules: Record<string, virtual.VirtualModule> = {}
	let sources: Record<string, string> = {}

	let markdowns: string[] = []
	let css: string[] = []

	function load() {
		assets = readdirSync(assetspath, { recursive: true, encoding: 'utf-8' })
		markdowns = assets.filter(markdownFilter)
		css = assets.filter(cssFilter).map(resolvePath)

		modules = {}
		sources = {}
		markdowns.forEach((src) => {
			const module = virtual.createSlideComponent(src)
			modules[module.id] = module
			sources[resolvePath(src)] = module.id
		})

		env.SLIDEMD_LIST = markdowns.join(',')
	}

	function reloadModule(server: ViteDevServer, id: string, before?: () => void) {
		const module = server.moduleGraph.getModuleById(id)
		if (module) {
			before?.()
			server.reloadModule(module)
		}
	}

	function read(src: string): Markdown {
		const raw = readFileSync(resolvePath(src), { encoding: 'utf-8' })
		return {
			filepath: src,
			raw
		}
	}

	function write(filepath: string, content: string) {
		const writepath = path.join(cachepath, filepath)
		mkdirSync(path.dirname(writepath), { recursive: true })
		writeFileSync(writepath, content)
	}

	const context: Context = {
		markdowns: () => markdowns,
		css: () => ({ css, builtin: builtinCSS }),
		read,
		write,
		extract: extractFrontmatter,
		parse: parseSlide
	}

	load()

	return {
		name: 'SlideMD',
		enforce: 'pre',
		resolveId: {
			order: 'pre',
			handler(id) {
				if (modules[id]) {
					return id
				}
			}
		},

		configureServer(server) {
			const updateSlide = () => {
				reloadModule(server, virtual.slide.id, load)
			}

			server.watcher.add(path.join(assetspath))
			server.watcher.on('add', updateSlide)
			server.watcher.on('unlink', updateSlide)
		},

		async load(id) {
			if (virtual.slide.id === id) {
				return virtual.slide.getContent.call(context)
			}

			if (virtual.config.id === id) {
				return virtual.config.getContent.call(context)
			}

			const module = modules[id]
			if (module) {
				return await module.getContent.call(context)
			}
		},

		handleHotUpdate({ file, server }) {
			const filepath = path.relative(assetspath, file)
			if (filepath.endsWith('.md') && sources[filepath]) {
				reloadModule(server, sources[filepath])
			}

			if (filepath.endsWith('.css')) {
				reloadModule(server, virtual.config.id)
			}
		}
	}
}
