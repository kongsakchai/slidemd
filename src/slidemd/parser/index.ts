/* eslint-disable @typescript-eslint/no-explicit-any */
import yaml from 'js-yaml'
import rehypeStringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import type { SlideContentInfo } from '../types'
import { remarkSlideMD } from './core'

const processor = unified()
	.use(markdown)
	.use(remarkGfm)
	.use(remarkGemoji)
	.use(remarkSlideMD)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeStringify, {
		allowDangerousHtml: true,
		collapseEmptyAttributes: true,
		allowDangerousCharacters: true,
		quoteSmart: true
	})

export const extractFrontmatter = (markdown: string) => {
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

export const parseSlide = async (markdown: string, properties: Record<string, any>): Promise<SlideContentInfo[]> => {
	const pages = markdown.split(/\r?\n---\r?\n/)
	const slides: SlideContentInfo[] = []
	const directive = { ...properties }
	for (const [index, p] of pages.entries()) {
		directive.page = index + 1
		directive.step = 0
		directive.note = undefined

		const file = await processor.process({ value: p, data: directive })

		slides.push({
			page: index + 1,
			note: directive['note'],
			step: directive['step'],
			content: file.toString()
		})
	}

	return slides
}
