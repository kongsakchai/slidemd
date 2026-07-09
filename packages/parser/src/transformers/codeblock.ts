import type { ElementContent, Root as HRoot, RootContent as HRootContent } from 'hast'
import type { Code, Parent, Root, RootContent } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Attribute, SlideContext } from '../types.js'

export type CodeHighlighter = (
	lang: string,
	code: string,
	meta?: string
) => Promise<HRootContent | ElementContent | HRoot>
export type CodeContainer = (lang: string, attr: Attribute) => Promise<Parent>

export interface CodeblockOptions {
	highlight?: CodeHighlighter
	container?: CodeContainer
}

export function codeblockTransformer(options?: CodeblockOptions): Transformer {
	const container = options?.container ?? defaultContainer
	const highlight = options?.highlight ?? defaultHighlight

	return async (tree, vfile) => {
		const ctx = vfile.data.context as SlideContext

		const codeProcess: Promise<void>[] = []
		visit(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			codeProcess.push(transformCodeNode(node, index, parent, highlight, container))
			ctx.codeLanguage.add(node.lang || 'plaintext')
		})

		await Promise.all(codeProcess)
	}
}

function escapeSpecialCharacters(str: string) {
	return str.replaceAll(/[{}]/g, (char) => `{'${char}'}`)
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

	const html = await highlight(lang, node.value, node.meta || undefined)
	visit(html, 'text', (node) => {
		node.value = escapeSpecialCharacters(node.value)
	})

	containerEl.data?.hChildren?.push(html as ElementContent)
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
		children: [{ type: 'text', value: code }]
	}
}

const ATTR_REGEX = /([.#a-zA-Z][\w-@:()[\]]+)(?:=(["'])(.*?)\2|=({.*?})|=([^\s]*))?/g

function extractAttributes(str?: string | null): Record<string, string> {
	if (!str) return {}

	const attrs: Record<string, string> = {}
	const ids: string[] = []
	const className: string[] = []

	for (const match of str.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[3] || match[4] || match[5] || ''

		if (key === 'class') {
			className.push(value)
		} else if (key === 'id') {
			ids.push(value)
		} else if (key.startsWith('.')) {
			className.push(key.slice(1) + value)
		} else if (key.startsWith('#')) {
			ids.push(key.slice(1) + value)
		} else {
			attrs[key] = value
		}
	}
	if (className.length > 0) attrs['class'] = className.join(' ').trim()
	if (ids.length > 0) attrs['id'] = ids.join(' ').trim()

	return attrs
}
