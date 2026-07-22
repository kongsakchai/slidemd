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
	buildIn: string[]
}

const BUILT_IN_NAMES = ['CodeStepBlock']
const BUILT_IN_REGEX = new RegExp(`[^\\w/](${BUILT_IN_NAMES.join('|')})[^\\w]`, 'g')

export function checkBuiltIn(source: string[]) {
	const inSource = source.flatMap((s) => [...s.matchAll(BUILT_IN_REGEX)].map((s) => s[1]))
	return [...new Set(inSource)]
}

export function scriptContent(opt: ScriptOptions) {
	const imports: string[] = []
	const initScript: string[] = []

	imports.push('import { initStep } from "@slidemd/slidemd/logic/step.svelte"')
	initScript.push('initStep()')

	if (opt.codeLanguage.length > 0) {
		imports.push('import { initCopyCode } from "@slidemd/slidemd/logic/code"')
		initScript.push('initCopyCode()')

		imports.push('import { renderMermaid } from "@slidemd/slidemd/logic/mermaid"') // auto remove when don't use
		if (opt.codeLanguage.includes('mermaid')) {
			initScript.push('renderMermaid()')
		}

		if (opt.buildIn.length > 0) {
			imports.push(`import { ${opt.buildIn.join(',')} } from "@slidemd/slidemd/builtin"`) // auto remove when don't use
		}
	}

	const scripts = [
		`<script lang="ts" module>`,
		`export const slide = ${JSON.stringify(opt.data)}`,
		`</script>`,
		`<script lang="ts">`,
		...imports,
		...initScript,
		`let { page=$bindable(),step=$bindable() } = $props()`,
		...opt.scripts,
		'</script>'
	]

	return scripts.filter(Boolean).join('\n')
}
