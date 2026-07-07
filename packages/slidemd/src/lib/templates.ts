import type { SlideData } from './types'

export interface PageOptions {
	layout?: string
	class?: string
	style?: string
	background?: string
	pageNumber?: number
	split?: string
}

export function pageContent(content: string, page: number, opt: PageOptions = {}) {
	const className = opt.class ? `slide ${opt.class}` : 'slide'
	const style = opt.style ? `style="${opt.style}"` : ''
	const layout = opt.layout || 'default'

	const pages = [
		`<section class='${className}' ${style} data-page='${page}' hidden='{page !== ${page}}' layout='${layout}'>`,
		opt.background ? `<div class='slide-background' style='${opt.background}'></div>` : '',
		opt.pageNumber ? `<div class="slide-page-number">${opt.pageNumber}</div>` : '',
		opt.split ? `<div class="split" ${opt.split}>${content}</div>` : content,
		`</section>`
	]

	return pages.filter(Boolean).join('\n')
}

export function styleContent(styleTag: string[] = []) {
	if (styleTag.length === 0) return ''

	const styles = [
		'<style lang="postcss">',
		'@reference "tailwindcss";',
		'@reference "@slidemd/slidemd/themes/slidemd.css";',
		...styleTag,
		'</style>'
	]

	return styles.filter(Boolean).join('\n')
}

const mermaidScript = {
	import: `import mermaid from 'mermaid'`,
	script: [
		`onMount(() => {`,
		`mermaid.initialize({`,
		`startOnLoad: false`,
		`})`,
		`mermaid.run().then(() => console.log('Mermaid diagrams rendered'))`,
		`})`
	]
}

export function scriptContent(slideData: SlideData, scriptTag: string[] = []) {
	const scripts = [
		`<script lang="ts" module>`,
		`export const slide = ${JSON.stringify(slideData)}`,
		`</script>`,
		`<script lang="ts">`,
		`import { onMount } from 'svelte'`,
		`import {copyCode} from '@slidemd/slidemd/shared'`,
		mermaidScript.import,
		`let { page=$bindable() } = $props()`,
		...mermaidScript.script,
		...scriptTag,
		'</script>'
	]

	return scripts.filter(Boolean).join('\n')
}
