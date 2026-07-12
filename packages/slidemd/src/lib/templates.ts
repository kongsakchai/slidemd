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
		opt.split ? `<div class="split" style="${opt.split}">${content}</div>` : content,
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

interface ScriptOptions {
	data: SlideData
	scripts: string[]
	codeLanguage: string[]
}

export function scriptContent(opt: ScriptOptions) {
	const imports: string[] = []
	const actions: string[] = []
	if (opt.codeLanguage.length > 0) {
		imports.push('import {initCopyCode} from "@slidemd/slidemd/logic/code"')
		imports.push('import {CodeStepBlock} from "@slidemd/slidemd/components"')
		actions.push('initCopyCode()')

		if (opt.codeLanguage.includes('mermaid')) {
			imports.push('import {renderMermaid} from "@slidemd/slidemd/logic/mermaid"')
			actions.push('renderMermaid()')
		}
	}

	const scripts = [
		`<script lang="ts" module>`,
		`export const slide = ${JSON.stringify(opt.data)}`,
		`</script>`,
		`<script lang="ts">`,
		...imports,
		...actions,
		`let { page=$bindable() } = $props()`,
		...opt.scripts,
		'</script>'
	]

	return scripts.filter(Boolean).join('\n')
}
