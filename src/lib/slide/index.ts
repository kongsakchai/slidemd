import yaml from 'js-yaml'
import rehypeStringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified, type Processor } from 'unified'
import {
	codeTransformer,
	directiveStore,
	enhanceCodeTransformer,
	htmlTransformer,
	imageTransformer,
	splitTransformer,
	type DirectiveStore
} from './transformers'
import type { Directive, Slide, SlidePage, SlideProperties } from './types'

const regexp = {
	// [\r\n]* match 0 or more of leading newlines
	// [\s\S]+? match any character (including newlines) in a non-greedy way
	// [\r\n]? match an optional trailing newline
	frontMatter: /^[\r\n]*---\r?\n([\s\S]+?)[\r\n]?---/g
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cache: Processor<any, any, any, any, any> | undefined

// Markdown
// - remark-parse -> mdast (Markdown AST).
// - remark-gfm -> mdast (Support tables, strikethrough, and task lists).
// - remark-rehype -> hast (HTML AST)
// - rehype-stringify -> HTML string
const setupProcessor = () => {
	if (cache) return cache

	cache = unified()
		.use(markdown)
		.use(remarkGfm)
		.use(remarkGemoji)
		.use(directiveStore)
		.use(splitTransformer)
		.use(htmlTransformer)
		.use(imageTransformer)
		.use(codeTransformer)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(enhanceCodeTransformer)
		.use(rehypeStringify, { allowDangerousHtml: true })

	return cache
}

const extractFrontmatter = (markdown: string) => {
	const match = regexp.frontMatter.exec(markdown)
	if (!match) {
		return { body: markdown, metadata: {} }
	}
	regexp.frontMatter.lastIndex = 0 // Reset the lastIndex for the next match

	// match[1] contains the frontmatter content
	const frontMatter = yaml.load(match[1]) as Record<string, unknown>
	const metadata: SlideProperties = {
		title: frontMatter.title as string,
		bgImg: frontMatter.bgImg as string,
		bgColor: frontMatter.bgColor as string,
		bgSize: frontMatter.bgSize as string,
		bgPosition: frontMatter.bgPosition as string,
		bgRepeat: frontMatter.bgRepeat as string,
		paging: frontMatter.paging as boolean | 'skip' | 'hold',
		class: frontMatter.class as string,
		style: frontMatter.style as string
	}
	// match[0] contains the entire match including the frontmatter
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
const toPage = async (markdown: string, baseDirective?: Directive): Promise<MarkdownToPageResult> => {
	const timeStart = Date.now()

	const processor = setupProcessor()

	const file = await processor.process(markdown)
	const directives = file.data.directives as DirectiveStore
	const split = (file.data.split as boolean) || false

	const global = { ...baseDirective, ...directives.global }
	const local = { ...global, ...directives.local }

	console.debug(`Markdown processed in ${Date.now() - timeStart}ms`)

	return {
		html: file.toString(),
		directive: {
			global,
			local
		},
		split
	}
}

const process = async (markdown: string): Promise<Slide> => {
	const { body, metadata } = extractFrontmatter(markdown)
	const bodyList = body.split(/[\r\n]*---[\r\n]/) // Split by "---" and filter out empty strings

	const pages: SlidePage[] = []
	let globalDirective = metadata as Directive

	for (const str of bodyList) {
		const { html, directive } = await toPage(str.trim(), globalDirective)
		globalDirective = directive.global

		pages.push({ html, directive: directive.local })
	}

	return {
		pages,
		properties: metadata
	}
}

export default { extractFrontmatter, toPage, process }
