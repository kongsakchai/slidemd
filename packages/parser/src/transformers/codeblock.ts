import type { ElementContent } from 'hast'
import type { Code, Parent, Root, RootContent } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Attribute } from '../types.js'
import { extractAttributes } from './utils.js'

export type CodeHighlighter = (lang: string, code: string) => Promise<ElementContent>
export type CodeContainer = (lang: string, attr: Attribute) => Promise<Parent>

export interface CodeblockOptions {
	highlight?: CodeHighlighter
	container?: CodeContainer
}

export function codeblockTransformer(options?: CodeblockOptions): Transformer {
	const container = options?.container ?? defaultContainer
	const highlight = options?.highlight ?? defaultHighlight

	return async (tree) => {
		const codeProcess: Promise<void>[] = []
		visit(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			codeProcess.push(transformCodeNode(node, index, parent, highlight, container))
		})

		await Promise.all(codeProcess)
	}
}

function escapeSpecialCharacters(str: string) {
	return str.replaceAll(/[&<>{}:]/g, (char) => `{'${char}'}`)
}

async function transformCodeNode(
	node: Code,
	index: number,
	parent: Parent,
	highlight: CodeHighlighter,
	container: CodeContainer
) {
	const lang = node.lang || 'plaintext'
	const attr = extractAttributes(node.meta)
	attr.class = `language-${lang} ${attr.class ?? ''}`.trim()

	const containerEl = await container(lang, attr)
	parent.children.splice(index, 1, containerEl as RootContent)

	const html = await highlight(lang, node.value)
	containerEl.data?.hChildren?.push(html)
}

async function defaultContainer(lang: string, attrs: Attribute): Promise<Parent> {
	return {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs,
			hChildren: [{ type: 'raw', value: `<span class="lang">${lang}</span>` }]
		},
		children: []
	}
}

async function defaultHighlight(lang: string, code: string): Promise<ElementContent> {
	return {
		type: 'element',
		tagName: 'pre',
		properties: { lang },
		children: [{ type: 'text', value: escapeSpecialCharacters(code) }]
	}
}
