import { rmMarkdownExtension } from '@/utils'

import path from 'node:path'

import { Module } from './types'

export const slideIndex: Module = {
	id: '@slide:index.svelte',
	content(ctx) {
		return [
			`<script lang="ts">`,
			`const contents: string[] = ${JSON.stringify(ctx.markdowns)}`,
			`</script>`,
			`<main class="h-full w-full p-6">`,
			`{#each contents as content}`,
			`<a href="/{content}">{content}</a>`,
			`{/each}`,
			`</main>`
		].join('\n')
	}
}

export const createSlide = (src: string): Module => {
	const filename = rmMarkdownExtension(src)
	return {
		id: filename + '.svelte',
		content(ctx) {
			return [
				`<script lang="ts">`,
				`import { SlideViewer } from '@slidemd/slidemd/components'`,
				`import Slide, { slide } from '${src}'`,
				`import "./src/app.css"`,
				`</script>`,
				`<main class="h-full w-full rounded-sm">`,
				`<SlideViewer slide={Slide} data={slide} />`,
				`</main>`
			].join('\n')
		}
	}
}

export const createMarkdown = (src: string): Module => {
	return {
		id: src,
		content(ctx) {
			return ctx.read(path.join(ctx.root, src))
		}
	}
}
