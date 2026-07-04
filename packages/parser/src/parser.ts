import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'

import { slidemdExtension } from './extensions/index.js'
import { CodeContainer, CodeHighlighter, applyTransformers } from './transformers/index.js'
import type { Directive, SlideParsed } from './types.js'
import { asNumber, asString, parseYAML } from './utils.js'

export type { CodeContainer, CodeHighlighter } from './transformers/index.js'

export interface Options {
	codeContainer?: CodeContainer
	codeHighlighter?: CodeHighlighter
}

export function setupProcessor(options?: Options) {
	const mdastTransform = unified()
		.use(markdown)
		.use(remarkGemoji)
		.use(remarkGfm, { singleTilde: false })
		.use(slidemdExtension)

	applyTransformers(mdastTransform, {
		codeblock: {
			container: options?.codeContainer,
			highlight: options?.codeHighlighter
		}
	})

	const hastTransform = mdastTransform.use(remark2Rehype, {
		allowDangerousHtml: true
	})

	return hastTransform.use(stringify, {
		allowDangerousHtml: true
	})
}

export function createSlideParser(options?: Options) {
	const parser = setupProcessor(options)

	async function parse(markdown: string, data?: Directive): Promise<SlideParsed> {
		const pages = markdown.split(/\r?\n---\r?\n/)
		const slideData: SlideParsed = { slides: [], script: [], style: [] }

		let global = { ...data }
		for (const [index, page] of pages.entries()) {
			const file = await parser.process({ value: page, data: { global: global, local: {} } })
			const slide = {
				index: index,
				content: file.toString(),
				global: file.data.global as Directive,
				local: file.data.local as Directive,
				title: asString(file.data.title),
				note: asString(file.data.note),
				step: asNumber(file.data.step)
			}

			slideData.slides.push(slide)
			if (file.data.script) slideData.script.push(asString(file.data.script, ''))
			if (file.data.style) slideData.style.push(asString(file.data.style, ''))

			global = { ...slide.global }
		}

		return slideData
	}

	return { parse }
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)---/

export function extractFrontmatter(markdown: string) {
	const match = FRONT_MATTER.exec(markdown)
	if (!match) return { body: markdown, metadata: {} }

	const metadata = parseYAML(match[1])
	const body = markdown.slice(match[0].length).trim()

	return { metadata, body }
}
