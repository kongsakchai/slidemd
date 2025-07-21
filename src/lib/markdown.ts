import yaml from 'js-yaml'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { slideTransform } from './transforms'
import type { Directive, Slide, SlidePage, SlideProperties } from './types'

const regexp = {
	// [\r\n]* match 0 or more of leading newlines
	// [\s\S]+? match any character (including newlines) in a non-greedy way
	// [\r\n]? match an optional trailing newline
	frontMatter: /^[\r\n]*---\r?\n([\s\S]+?)[\r\n]?---/g
}

// Markdown
// - remark-parse -> mdast (Markdown AST).
// - remark-rehype -> hast (HTML AST)
// - rehype-stringify -> HTML string
const processor = unified()
	.use(remarkParse)
	.use(slideTransform)
	.use(remarkRehype, { allowDangerousHtml: true })
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

// Convert markdown to HTML and extract directives
// - The global directive is merged with the base directive
// - The local directive overrides the global directive
const markdownToPage = async (
	markdown: string,
	baseDirective?: Directive
): Promise<{ html: string; globalDirective: Directive; localDirective: Directive }> => {
	const file = await processor.process(markdown)
	const directive = (file.data.directives || {}) as { global: Directive; local: Directive }

	const globalDirective = { ...baseDirective, ...directive.global }
	const localDirective = { ...globalDirective, ...directive.local }

	return {
		html: file.toString(),
		globalDirective,
		localDirective
	}
}

const markdownToSlide = async (markdown: string): Promise<Slide> => {
	const { body, metadata } = extractFrontmatter(markdown)
	const bodyList = body.split(/^[\r\n]*---[\r\n]?/) // Split by "---" and filter out empty strings

	const pages: SlidePage[] = []
	let directive = metadata as Directive

	for (const str of bodyList) {
		const { html, globalDirective, localDirective } = await markdownToPage(str.trim(), directive)
		directive = globalDirective

		pages.push({ html, directive: localDirective })
	}

	return {
		pages,
		properties: metadata
	}
}

export { extractFrontmatter, markdownToPage, markdownToSlide }
