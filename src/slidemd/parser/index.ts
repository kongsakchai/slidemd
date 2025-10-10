/* eslint-disable @typescript-eslint/no-explicit-any */
import yaml from 'js-yaml'
import rehypeStringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import type { SlideInfo } from '../types'
import { remarkSlideMD } from './markdown'

const processor = unified()
	.use(markdown)
	.use(remarkGfm)
	.use(remarkGemoji)
	.use(remarkSlideMD)
	.use(remarkRehype, { allowDangerousHtml: true })
	// .use(remarkTagConvert)
	.use(rehypeStringify, { allowDangerousHtml: true })

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

export const parseSlide = async (markdown: string, properties: Record<string, any>): Promise<SlideInfo[]> => {
	const pages = markdown.split(/\r?\n---\r?\n/)
	const slides = pages.map(async (v, i) => {
		const file = await processor.process({ value: v, data: properties })

		return {
			index: i + 1,
			source: file.toString(),
			class: '',
			note: ''
		}
	})

	return await Promise.all(slides)
}
