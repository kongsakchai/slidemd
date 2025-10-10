import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { env } from 'process'
import type { Plugin } from 'vite'
import { extractFrontmatter, parseSlide } from './parser'
import type { SlideMarkdown, SlideMD } from './types'
import * as virtual from './virtual'

export const slideMD = async (): Promise<Plugin> => {
	const sourcepath = path.resolve(env.SLIDEMD_PATH || 'src/examples')

	let components: virtual.VirtualModule[] = []

	function load() {
		const markdowns = readdirSync(sourcepath, {
			recursive: true,
			encoding: 'utf-8'
		}).filter((d) => {
			return /\.md$/.test(d) && /\/./.test(d)
		})

		components = markdowns.map(virtual.createSlideComponent)
		env.SLIDEMD_LIST = markdowns.join(',')

		return markdowns
	}

	function loadMarkdown(src: string): SlideMarkdown {
		const raw = readFileSync(path.join(sourcepath, src), { encoding: 'utf-8' })

		return {
			filepath: src,
			raw
		}
	}

	async function process(markdown: SlideMarkdown): Promise<SlideMD> {
		const { body, metadata } = extractFrontmatter(markdown.raw)
		const title = metadata['title'] || 'Slide MD 🚀'
		const slides = await parseSlide(body, metadata)

		return {
			title: title,
			frontmatter: metadata,
			slides: slides,
			markdown: markdown
		}
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
				return await virtual.slide.getContent.call({ load, loadMarkdown, process })
			}

			const compnent = components.find((cpnt) => cpnt.id === id)
			if (compnent) {
				return await compnent.getContent.call({ load, loadMarkdown, process })
			}
		}
	}
}
