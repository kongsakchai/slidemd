import { extractFrontmatter, parseSlide } from '../parser'
import type { SlideContentInfo, SlideMD } from '../types'
import { readMarkdown, writeToCache } from '../utils'
import type { VirtualModule } from './types'

export const resolveComponentId = (src: string) => `@slidemd/components/${src}.svelte`

export const createSlideComponent = (src: string): VirtualModule => {
	const resolveId = resolveComponentId(src)

	return {
		id: resolveId,
		async getContent() {
			const markdown = readMarkdown(src)

			const { body, metadata } = extractFrontmatter(markdown.raw)

			const slides = await parseSlide(body, metadata).catch(() => {
				return [] as SlideContentInfo[]
			})

			const title = metadata['title'] || 'Slide MD 🚀'
			const pages = slides.map((s) => s.content)

			const meta: SlideMD = {
				title: title,
				frontmatter: metadata,
				slides: slides.map((s) => ({
					page: s.page || 0,
					step: s.step
				})),
				markdown
			}

			const components = [
				`<script lang="ts" module>`,
				`export const slide = ${JSON.stringify(meta)}`,
				`</script>`,
				`<script lang="ts">`,
				`import { copyCode } from '$lib/actions/copy-code'`,
				`import { regisSteps } from '$lib/states/step.svelte'`,
				`let { currentPage } = $props()`,
				`</script>`,
				...pages
			].join('\n')

			// 🔥 Sync file
			writeToCache(resolveId, components)

			return components
		}
	}
}
