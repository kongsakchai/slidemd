import { createSlideParser, extractFrontmatter } from '@slidemd/parser'

import MagicString from 'magic-string'
import type { PreprocessorGroup } from 'svelte/compiler'

import { attributeProcess } from './attribute'
import { codeContainer, codeHighlighter } from './code'
import { resolvePaginate, toBackgroundStyles, toSplitStyles } from './directive'
import { checkBuiltIn, pageContent, scriptContent, styleContent } from './templates'
import type { Options, SlideData } from './types'
import { asString } from './utils'

export function slidemd(options?: Options): PreprocessorGroup {
	const parser = createSlideParser({
		codeContainer: codeContainer,
		codeHighlighter: codeHighlighter,
		attributeProcess: attributeProcess
	})

	const parse = async (markdown: string) => {
		const { body, metadata } = extractFrontmatter(markdown)
		const slide = await parser.parse(body, metadata)

		const slideData: SlideData = {
			...metadata,
			title: asString(metadata.title, 'Slide MD'),
			pages: []
		}

		let page = { show: false, current: 0 }
		const contents = slide.slides.map((slide) => {
			const directive = { ...slide.global, ...slide.local }
			page = resolvePaginate(directive.paginate, page.current)

			slideData.pages.push({
				page: slide.index + 1,
				note: asString(directive.note)
			})

			return pageContent(slide.content, slide.index + 1, {
				pageNumber: page.show ? page.current : undefined,
				class: asString(directive.class),
				style: asString(directive.style),
				layout: asString(directive.layout, 'default'),
				background: toBackgroundStyles(directive),
				split: toSplitStyles(directive)
			})
		})

		const script = scriptContent({
			data: slideData,
			scripts: slide.script,
			codeLanguage: slide.codeLanguage,
			buildIn: checkBuiltIn(contents)
		})

		return [script, ...contents, styleContent(slide.style)].join('\n')
	}

	return {
		name: 'slidemd',
		markup: async ({ content, filename }) => {
			if (filename?.endsWith(options?.extension || '.svelte.md')) {
				const result = new MagicString(content)
				const parsed = await parse(content)

				result.update(0, content.length - 1, parsed)
				return { code: result.toString(), map: result.generateMap() }
			}
		}
	}
}
