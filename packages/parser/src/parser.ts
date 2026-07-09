import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'

import { slidemdExtension } from './extensions/index.js'
import { CodeContainer, CodeHighlighter } from './transformers/codeblock.js'
import { applyTransformers } from './transformers/index.js'
import { PAGE_BREAK_KEY } from './transformers/page-break.js'
import type { Directive, SlideContext, SlideInfo, SlideResult } from './types.js'
import { parseYAML } from './utils.js'

export type { CodeContainer, CodeHighlighter }

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
		allowDangerousHtml: true,
		allowDangerousCharacters: true
	})
}

export function createSlideParser(options?: Options) {
	const parser = setupProcessor(options)

	async function parse(markdown: string, data?: Directive): Promise<SlideResult> {
		const context: SlideContext = {
			slides: [{ breakIndex: 0, global: data }],
			style: [],
			script: [],
			codeLanguage: new Set<string>()
		}

		const parsed = await parser.process({ value: markdown, data: { context } })
		return covertSlideResult(context, parsed.toString())
	}

	return { parse }
}

function covertSlideResult(ctx: SlideContext, str: string): SlideResult {
	const slideInfo: SlideInfo[] = str.split(PAGE_BREAK_KEY).map((content, index) => {
		const previous = index === 0 ? undefined : ctx.slides[index - 1]
		const slide = ctx.slides[index]
		return {
			index,
			content,
			global: { ...slide.global, ...previous?.global },
			local: slide.local,
			title: slide.title,
			note: slide.note,
			step: slide.step
		}
	})

	return {
		slides: slideInfo,
		script: ctx.script,
		style: ctx.style,
		codeLanguage: [...ctx.codeLanguage]
	}
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)---/

export function extractFrontmatter(markdown: string) {
	const match = FRONT_MATTER.exec(markdown)
	if (!match) return { body: markdown, metadata: {} }

	const metadata = parseYAML(match[1])
	const body = markdown.slice(match[0].length).trim()

	return { metadata, body }
}
