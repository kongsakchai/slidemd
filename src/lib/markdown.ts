import yaml from 'js-yaml'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import type { SlideProperties } from './types'

//Markdown > remark-parse
//mdast (Markdown AST) > remark-rehype
//hast (HTML AST) > rehype-stringify
//HTML string
const processor = unified()
	.use(remarkParse)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeStringify, { allowDangerousHtml: true })

const extractFrontmatter = (markdown: string) => {
	// [\r\n]* match 0 or more of leading newlines
	// [\s\S]+? match any character (including newlines) in a non-greedy way
	// [\r\n]? match an optional trailing newline
	const match = /^[\r\n]*---\r?\n([\s\S]+?)[\r\n]?---/.exec(markdown)
	if (!match) {
		return { body: markdown, metadata: {} }
	}

	// match[0] contains the entire match including the frontmatter
	// match[1] contains the frontmatter content
	const metadata = yaml.load(match[1]) as SlideProperties
	const body = markdown.slice(match[0].length)

	return { body, metadata }
}

const markdownToHtml = async (markdown: string): Promise<string> => {
	try {
		const file = await processor.process(markdown)
		return String(file)
	} catch (error) {
		console.error('Error processing markdown:', error)
		return ''
	}
}

export { extractFrontmatter, markdownToHtml }
