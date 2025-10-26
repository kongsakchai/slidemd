import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { env } from 'process'
import type { Plugin } from 'vite'
import { extractFrontmatter, parseSlide } from './parser'
import type { Context, Markdown } from './types'
import * as virtual from './virtual'

const assetspath = path.resolve(env.SLIDEMD_PATH || 'src/examples')
const cachepath = path.resolve('.slidemd-cache')
const builtinpath = path.resolve('src/builtin')

const markdownFilter = (d: string) => /\.md$/.test(d) && !/^\.|\/\./.test(d)
const cssFilter = (d: string) => /\.css$/.test(d) && !/^\.|\/\./.test(d) && /^themes\//.test(d)

export const slideMD = async (): Promise<Plugin> => {
	const builtinAssets = readdirSync(builtinpath, { recursive: true, encoding: 'utf-8' })
	const assets = readdirSync(assetspath, { recursive: true, encoding: 'utf-8' })

	const modules: Record<string, virtual.VirtualModule> = {}
	modules[virtual.config.id] = virtual.config
	modules[virtual.slide.id] = virtual.slide

	function markdowns() {
		const markdowns = assets.filter(markdownFilter)
		env.SLIDEMD_LIST = markdowns.join(',')
		markdowns.map(virtual.createSlideComponent).forEach((m) => (modules[m.id] = m))

		return markdowns
	}

	function css() {
		const css = assets.filter(cssFilter).map((src) => path.join(assetspath, src))
		const buildinCSS = builtinAssets.filter(cssFilter).map((src) => path.join(builtinpath, src))

		return [...buildinCSS, ...css]
	}

	function loadMarkdown(src: string): Markdown {
		const raw = readFileSync(path.join(assetspath, src), { encoding: 'utf-8' })
		return {
			filepath: src,
			raw
		}
	}

	function writeCache(filepath: string, content: string) {
		const writepath = path.join(cachepath, filepath)
		mkdirSync(path.dirname(writepath), { recursive: true })
		writeFileSync(writepath, content)
	}

	const context: Context = {
		markdowns,
		css,
		loadMarkdown,
		writeCache,

		extract: extractFrontmatter,
		parse: parseSlide
	}

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

		async load(id) {
			const module = modules[id]
			if (module) {
				return await module.getContent.call(context)
			}
		}
	}
}
