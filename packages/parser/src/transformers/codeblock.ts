import type { ElementContent } from 'hast'
import type { Parent, Root, RootContent } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Attribute } from '../types.js'
import { extractAttributes } from './utils.js'

export type CodeHighlighter = (lang: string, code: string) => Promise<ElementContent>
export type CodeContainer = (lang: string, attr: Attribute) => Parent

export interface CodeblockOptions {
	highlight?: CodeHighlighter
	container?: CodeContainer
}

interface CodeBlock {
	lang: string
	code: string
	parent: Parent
}

export function codeblockTransformer(options?: CodeblockOptions): Transformer {
	const container = options?.container ?? defaultContainer
	const highlight = options?.highlight ?? defaultHighlight

	return async (tree) => {
		const codeblocks: CodeBlock[] = []
		visit(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			const lang = node.lang || 'plaintext'
			const attr = extractAttributes(node.meta)
			attr.class = `language-${lang} ${attr.class || ''}`.trim()

			const containerEl = container(lang, attr)
			parent.children.splice(index, 1, containerEl as RootContent)
			codeblocks.push({
				lang: lang,
				code: node.value,
				parent: containerEl
			})
		})

		await Promise.all(
			codeblocks.map(async (block) => {
				const html = await highlight(block.lang, block.code)
				block.parent.data?.hChildren?.push(html)
			})
		)
	}
}

export const escapeSpecialCharacters = (str: string) => {
	const a = str.replaceAll(/[&<>{}:]/g, (char) => `{'${char}'}`)
	return a
}

function defaultContainer(lang: string, attrs: Attribute) {
	const container: Parent = {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs,
			hChildren: [{ type: 'raw', value: `<span class="lang">${lang}</span>` }]
		},
		children: []
	}
	return container
}

async function defaultHighlight(lang: string, code: string) {
	const container: ElementContent = {
		type: 'element',
		tagName: 'pre',
		properties: { lang },
		children: [{ type: 'text', value: escapeSpecialCharacters(code) }]
	}
	return container
}
