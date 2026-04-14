import { createParser } from '@slidemd/parse'
import yaml from 'js-yaml'
import MagicString from 'magic-string'
import { PreprocessorGroup } from 'svelte/compiler'

export interface SlideInfo {
	slides: SlideContent[]
	metadata: Record<string, any>
	script: string
	style: string
}

export interface SlideContent {
	content: string
	page: number
	note?: string
	step?: number
}

export interface Options {
	extension?: string
}

export function extractFrontmatter(markdown: string) {
	const match = /^---\r?\n([\s\S]*?)---/.exec(markdown)
	if (!match) {
		return { body: markdown, metadata: {} }
	}

	// match[1] contains the frontmatter content
	const metadata = yaml.load(match[1]) as Record<string, any>
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

	const parse = async (markdown: string) => {
		const { body, metadata } = extractFrontmatter(markdown)

		const pages = body.split(/\r?\n---\r?\n/)
		const directive = { ...metadata }
		const slides: SlideContent[] = []

		for (const [i, page] of pages.entries()) {
			directive.page = i + 1
			directive.step = 0
			directive.note = undefined

			const file = await parser.process({ value: page, data: directive })

			slides.push({
				page: i + 1,
				note: directive.note,
				step: directive.step,
				content: file.toString()
			})
		}

		return { slides, metadata, script: directive.script, style: directive.style }
	}

	const toSvelte = async (markdown: string) => {
		const { slides, metadata, script, style } = await parse(markdown)

		const pages = slides.map((slide) => {
			return [
				`<section class="slide" data-page="${slide.page}" hidden="{currentPage ==${slide.page}}">`,
				slide.content,
				`</section>`
			].join('\n')
		})

		const component = [
			'<script lang="ts">',
			"import {copyCode} from '@slidemd/slidemd/actions'",
			script,
			'let { currentPage } = $props()',
			'const data = ' + JSON.stringify(metadata),
			'</script>',
			...pages
		]

		return component.join('\n')
	}

	return {
		name: 'slidemd',
		markup: async ({ content, filename }) => {
			if (filename?.endsWith(options?.extension || '.svmd')) {
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
