import { asString, createParser, extractFrontmatter } from '@slidemd/parser'

import MagicString from 'magic-string'
import type { PreprocessorGroup } from 'svelte/compiler'

import { transform } from './transform'
import type { Options, SlideData } from './types'

export function slidemd(options?: Options): PreprocessorGroup {
	const parser = createParser()

	const parse = async (markdown: string) => {
		const { body, metadata } = extractFrontmatter(markdown)
		const slide = await parser.parse(body, metadata)

		const slideData: SlideData = {
			...metadata,
			title: asString(metadata.title, 'Slide MD'),
			pages: []
		}

		const shared = { paginate: 1 }
		const contents = slide.slides.map((slide) => {
			const directive = { ...slide.global, ...slide.local }
			const page = slide.index + 1
			const content = transform(slide.content, directive, shared)

			slideData.pages.push({
				step: slide.step,
				note: slide.note
			})

			const className = asString(directive.class, '')
			const style = asString(directive.style, '')
			const layout = asString(directive.layout, 'default')

			return [
				`<section class='slide ${className}' style='${style}' data-page='${page}' hidden='{page !== ${page}}' layout='${layout}'>`,
				content,
				`</section>`
			].join('\n')
		})

		const styles = slide.style
			? [
					'<style lang="postcss">',
					'@reference "tailwindcss";',
					'@reference "@slidemd/slidemd/themes/slidemd.css";',
					slide.style,
					'</style>'
				]
			: []

		const component = [
			`<script lang="ts" module>`,
			`export const slide = ` + JSON.stringify(slideData),
			`</script>`,
			'<script lang="ts">',
			"import {copyCode} from '@slidemd/slidemd/shared'",
			'let { page=$bindable() } = $props()',
			slide.script,
			'</script>',
			...contents,
			...styles
		]

		return component.join('\n')
	}

	return {
		name: 'slidemd',
		markup: async ({ content, filename }) => {
			if (filename?.endsWith(options?.extension || '.svelte.md')) {
				const result = new MagicString(content)
				const parsed = await parse(content)

				result.update(0, content.length - 1, String(parsed))
				return {
					code: result.toString(),
					map: result.generateMap()
				}
			}
		}
	}
}
