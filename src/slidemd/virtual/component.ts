import type { VirtualModule } from './types'

export const createSlideComponent = (src: string): VirtualModule => {
	const resolveId = `@slidemd/components/${src}.svelte`

	return {
		id: resolveId,
		async getContent() {
			const markdown = this.loadMarkdown(src)
			const slideData = await this.process(markdown)

			const meta = {
				title: slideData.title,
				properties: slideData.frontmatter
			}
			const pages = slideData.slides.map(
				(s) => `<section class:contents class:hidden={currentPage !== ${s.index}}>${s.source}</section>`
			)

			return [
				`<script lang="ts" module>`,
				`export const meta = ${JSON.stringify(meta)}`,
				`</script>`,
				`<script lang="ts">`,
				`let { currentPage } = $props()`,
				`</script>`,
				...pages
			].join('\n')
		}
	}
}
