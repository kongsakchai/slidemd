import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { env } from 'process'
import type { Plugin } from 'vite'
import { extractFrontmatter, parseSlide } from './parser'
import type { Context, Markdown } from './types'
import * as virtual from './virtual'

const sourcepath = path.resolve(env.SLIDEMD_PATH || 'src/examples')

export const slideMD = async (): Promise<Plugin> => {
	let components: virtual.VirtualModule[] = []

	function load() {
		const markdowns = readdirSync(sourcepath, { recursive: true, encoding: 'utf-8' }).filter((d) => {
			return /\.md$/.test(d) && !/^\.|\/\./.test(d)
		})

		components = markdowns.map(virtual.createSlideComponent)
		env.SLIDEMD_LIST = markdowns.join(',')

		return markdowns
	}

	function loadMarkdown(src: string): Markdown {
		const raw = readFileSync(path.join(sourcepath, src), { encoding: 'utf-8' })
		return {
			filepath: src,
			raw
		}
	}

	const context: Context = {
		load,
		loadMarkdown,

		extract: extractFrontmatter,
		parse: parseSlide
	}

	return {
		name: 'SlideMD',
		enforce: 'pre',
		resolveId: {
			order: 'pre',
			handler(id) {
				if (id === virtual.slide.id) {
					return id
				}

				if (id.startsWith('@slidemd/components/')) {
					return `${id}.svelte`
				}
			}
		},

		async load(id) {
			if (id === virtual.slide.id) {
				return await virtual.slide.getContent.call(context)
			}

			const component = components.find((cpnt) => cpnt.id === id)
			if (component) {
				return await component.getContent.call(context)
			}
		}
	}
}
