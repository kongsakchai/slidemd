import type { SlideMD } from '../types'
import type { VirtualModule } from './types'

export const createSlideComponent = (src: string): VirtualModule => {
	const resolveId = `@slidemd/components/${src}.svelte`

	return {
		id: resolveId,
		async getContent() {
			const markdown = this.read(src)
			const { body, metadata } = this.extract(markdown.raw)
			const title = metadata['title'] || 'Slide MD 🚀'
			const slides = await this.parse(body, metadata)

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
				`export const meta = ${JSON.stringify(meta)}`,
				`</script>`,
				`<script lang="ts">`,
				`import { regisSteps,copyCode } from '$lib/action.svelte'`,
				`let { currentPage } = $props()`,
				`</script>`,
				...pages
			].join('\n')

			// 🔥 Sync file
			this.write(resolveId, components)

			return components
		}
	}
}
