import yaml from 'js-yaml'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { shiki, shikiOptions } from './transforms/html/shiki'
import { slideTransform } from './transforms/markdown'
import type { Directive, Slide, SlidePage, SlideProperties } from './types'

const regexp = {
	// [\r\n]* match 0 or more of leading newlines
	// [\s\S]+? match any character (including newlines) in a non-greedy way
	// [\r\n]? match an optional trailing newline
	frontMatter: /^[\r\n]*---\r?\n([\s\S]+?)[\r\n]?---/g
}

// Markdown
// - remark-parse -> mdast (Markdown AST).
// - remark-gfm -> mdast (Support tables, strikethrough, and task lists).
// - remark-rehype -> hast (HTML AST)
// - rehype-stringify -> HTML string
const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(slideTransform)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(shiki, shikiOptions)
	.use(rehypeStringify, { allowDangerousHtml: true })

const extractFrontmatter = (markdown: string) => {
	const match = regexp.frontMatter.exec(markdown)
	if (!match) {
		return { body: markdown, metadata: {} }
	}
	regexp.frontMatter.lastIndex = 0 // Reset the lastIndex for the next match

	// match[0] contains the entire match including the frontmatter
	// match[1] contains the frontmatter content
	const metadata = yaml.load(match[1]) as SlideProperties
	const body = markdown.slice(match[0].length)

	return { body, metadata }
}

interface MarkdownToPageResult {
	html: string
	split: boolean
	directive: {
		global: Directive
		local: Directive
	}
}

// Convert markdown to HTML and extract directives
// - The global directive is merged with the base directive
// - The local directive overrides the global directive
const markdownToPage = async (markdown: string, baseDirective?: Directive): Promise<MarkdownToPageResult> => {
	const file = await processor.process(markdown)
	const directives = (file.data.directives || {}) as { global: Directive; local: Directive }
	const split = file.data.split as boolean | false

	const global = { ...baseDirective, ...directives.global }
	const local = { ...global, ...directives.local }

	return {
		html: file.toString(),
		directive: {
			global,
			local
		},
		split
	}
}

const markdownToSlide = async (markdown: string): Promise<Slide> => {
	const { body, metadata } = extractFrontmatter(markdown)
	const bodyList = body.split(/^[\r\n]*---[\r\n]?/) // Split by "---" and filter out empty strings

	const pages: SlidePage[] = []
	let globalDirective = metadata as Directive

	for (const str of bodyList) {
		const { html, directive } = await markdownToPage(str.trim(), globalDirective)
		globalDirective = directive.global

		pages.push({ html, directive: directive.local })
	}

	return {
		pages,
		properties: metadata
	}
}

export { extractFrontmatter, markdownToPage, markdownToSlide }
