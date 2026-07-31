import { join } from 'node:path'

import { virtualMarkdown } from './markdown'
import { VirtualModule } from './types'

const LAYOUT_ID = '@slide:layout/'

const SVELTE_EXT = '.svelte'

export const resolveLayoutId = (src: string) => join(LAYOUT_ID, src + SVELTE_EXT)

export const virtualLayout: VirtualModule = {
	id: LAYOUT_ID,
	content() {
		const markdown = this.id.slice(LAYOUT_ID.length, -SVELTE_EXT.length)
		return [
			`<script lang="ts">`,
			`import { SlideViewer } from '@slidemd/slidemd/components'`,
			`import Slide, { slide } from '${virtualMarkdown.id}${markdown}'`,
			`</script>`,
			`<svelte:head>`,
			`<title>{slide.title}</title>`,
			`</svelte:head>`,
			`<main class="h-full w-full rounded-sm">`,
			`<SlideViewer slide={Slide} data={slide} />`,
			`</main>`
		].join('\n')
	}
}
