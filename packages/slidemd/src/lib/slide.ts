import { type Directive, createParser } from '@slidemd/parse'

import yaml from 'js-yaml'
import MagicString from 'magic-string'
import type { PreprocessorGroup } from 'svelte/compiler'

import { asNumber, asString } from './helper'
import { createTransformer } from './transform'
import type { Content, Options, SlideData, Store } from './types'

export function extractFrontmatter(markdown: string) {
	const match = /^---\r?\n([\s\S]*?)---/.exec(markdown)
	if (!match) return { body: markdown, metadata: {} }

	// match[1] contains the frontmatter content
	const metadata = yaml.load(match[1]) as Directive
	// match[0] contains the entire match including the frontmatter
	const body = markdown.slice(match[0].length)

	return { body, metadata }
}

export function slidemd(options?: Options): PreprocessorGroup {
	const parser = createParser({
		transform: {
			codeblock: {
				copyEventName: 'copyCode'
			}
		}
	})

	const transformer = createTransformer()

	const parse = async (markdown: string) => {
		const { body, metadata } = extractFrontmatter(markdown)

		const pages = body.split(/\r?\n---\r?\n/)
		const slides: Content[] = []

		let script = ''
		let style = ''

		let global: Directive = { ...metadata }

		for (const [i, page] of pages.entries()) {
			const file = await parser.parse(page, { global })

			const directive = { ...file.data.global, ...file.data.local }
			slides.push({
				page: i + 1,
				step: asNumber(file.data.step, 0),
				note: asString(directive.note),
				directive: directive,
				content: file.value
			})

			script = file.data.script
			style = file.data.style

			// clear unshare directive
			global = file.data.global
			global.note = undefined
		}

		return { slides, metadata, script: script, style: style }
	}

	const toSvelte = async (markdown: string) => {
		const { slides, metadata, script, style } = await parse(markdown)

		const slideData: SlideData = {
			...metadata,
			title: typeof metadata.title === 'string' ? metadata.title : 'slidemd',
			pages: []
		}

		const store: Store = { paginate: 0, class: [], style: [], footer: '', header: '' }
		const contents = slides.map((slide) => {
			slideData.pages.push({ page: slide.page, step: slide.step, note: slide.note })
			store.class = []
			store.style = []
			store.footer = ''
			store.header = ''

			const content = transformer.process(slide.content, store, slide.directive)

			return [
				`<section class='slide ${store.class}' style='${store.style}' data-page='${slide.page}' hidden='{page !== ${slide.page}}'>`,
				content,
				`</section>`
			].join('\n')
		})

		const styles = style
			? [
					'<style lang="postcss">',
					'@reference "tailwindcss";',
					'@reference "@slidemd/slidemd/themes/slidemd.css";',
					style,
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
			script,
			'</script>',
			...contents,
			...styles
		]

		return component.join('\n')
	}

	return {
		name: 'slidemd',
		markup: async ({ content, filename }) => {
			if (filename?.endsWith(options?.extension || '.md')) {
				const result = new MagicString(content)
				const parsed = await toSvelte(content)

				result.update(0, content.length - 1, String(parsed))
				return {
					code: result.toString(),
					map: result.generateMap()
				}
			}
		}
	}
}
