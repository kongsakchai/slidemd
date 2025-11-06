import { readdirSync, rmSync } from 'fs'
import type { Plugin, ViteDevServer } from 'vite'

import { BUILTIN_PATH, CACHE_PATH, SLIDE_PATH } from './env'
import { cssFilter, markdownFilter, relativeAsset, resolveAsset, resolveBuiltin } from './utils'
import * as virtual from './virtual'

export const slideMD = async (): Promise<Plugin> => {
	const modules: Record<string, virtual.VirtualModule> = {}
	modules[virtual.slide.id] = virtual.slide
	modules[virtual.theme.id] = virtual.theme

	let components: Record<string, virtual.VirtualModule> = {}
	let markdowns: string[] = []
	let css: string[] = []
	let builtinCSS: string[] = []

	function loadBuiltin() {
		const builtin = readdirSync(BUILTIN_PATH, { recursive: true, encoding: 'utf-8' })
		builtinCSS = builtin.filter(cssFilter).map(resolveBuiltin)
	}

	function loadSlides() {
		const assets = readdirSync(SLIDE_PATH, { recursive: true, encoding: 'utf-8' })
		markdowns = assets.filter(markdownFilter)
		css = assets.filter(cssFilter).map(resolveAsset)

		components = Object.fromEntries(
			markdowns.map((src) => {
				const module = virtual.createSlideComponent(src)
				return [module.id, module]
			})
		)

		process.env.SLIDES = markdowns.join(',')
	}

	function reloadModule(server: ViteDevServer, id?: string) {
		const module = server.moduleGraph.getModuleById(id || '')
		if (module) {
			server.reloadModule(module)
		}
	}

	return {
		name: 'SlideMD',
		enforce: 'pre',

		config() {
			// clear cache
			rmSync(CACHE_PATH, { force: true, recursive: true })
			loadBuiltin()
			loadSlides()
		},

		resolveId: {
			order: 'pre',
			handler(id) {
				if (modules[id]) {
					return id
				}

				if (components[id]) {
					return id
				}
			}
		},

		configureServer(server) {
			const updateSlide = () => {
				loadBuiltin()
				loadSlides()

				reloadModule(server, virtual.theme.id)
				reloadModule(server, virtual.slide.id)
			}

			server.watcher.add(SLIDE_PATH)
			server.watcher.on('add', updateSlide)
			server.watcher.on('unlink', updateSlide)
		},

		async load(id) {
			const module = modules[id]
			if (module) {
				const data = await module.getContent({ markdowns, css, builtinCSS })
				return data
			}

			const component = components[id]
			if (component) {
				return await component.getContent()
			}
		},

		handleHotUpdate({ file, server }) {
			const filepath = relativeAsset(file)

			if (filepath.endsWith('.md')) {
				const id = virtual.resolveComponentId(filepath)
				const component = components[id]
				reloadModule(server, component.id)
			}
		}
	}
}
