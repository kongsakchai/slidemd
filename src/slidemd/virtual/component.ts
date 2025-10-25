import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import type { SlideMD } from '../types'
import type { VirtualModule } from './types'

const outputpath = path.resolve('.slidemd')

export const createSlideComponent = (src: string): VirtualModule => {
	const resolveId = `@slidemd/components/${src}.svelte`

	return {
		id: resolveId,
		async getContent() {
			const markdown = this.loadMarkdown(src)
			const { body, metadata } = this.extract(markdown.raw)
			const title = metadata['title'] || 'Slide MD 🚀'
			const slides = await this.parse(body, metadata)

			const pages = slides.map((s) => s.content)

			const meta: SlideMD = {
				title: title,
				frontmatter: metadata,
				slides: slides.map((s) => ({
					page: s.page || 0,
					click: s.click
				})),
				markdown
			}

			const components = [
				`<script lang="ts" module>`,
				`export const meta = ${JSON.stringify(meta)}`,
				`</script>`,
				`<script lang="ts">`,
				`import { regisClickable } from '$lib/action.svelte'`,
				`let { currentPage } = $props()`,
				`</script>`,
				...pages
			].join('\n')

			// 🔥 Sync file
			const syncpath = path.join(outputpath, resolveId)
			mkdirSync(path.dirname(syncpath), { recursive: true })
			writeFileSync(syncpath, components)

			return components
		}
	}
}
