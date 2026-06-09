import type { ElementContent } from 'hast'
import type { Data, Parent, Root, RootContent } from 'mdast'
import type { Transformer } from 'unified'

import { Attribute } from '../types.js'
import { asNumber } from '../utils.js'
import { getAttributes, mapNode } from './utils.js'

export type CodeHighlighter = (lang: string, code: string) => Promise<ElementContent>
export type CodeContainer = (lang: string, attr: Attribute) => Parent

export interface CodeblockOptions {
	highlight?: CodeHighlighter
	createContainer?: CodeContainer
}

export const escapeSpecialCharacters = (str: string) => {
	const a = str.replaceAll(/[&<>{}:]/g, (char) => `{'${char}'}`)
	return a
}

function createDefaultContainer(lang: string, attrs: Attribute) {
	const container: Parent = {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs as Data['hProperties'],
			hChildren: [
				{
					type: 'raw',
					value: `<span class="lang">${lang}</span>`
				}
			]
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

export function codeblockTransformer(options?: CodeblockOptions): Transformer {
	const createContainer = options?.createContainer ?? createDefaultContainer
	const highlight = options?.highlight ?? defaultHighlight

	return async (tree, vfile) => {
		const codeblocks = mapNode(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const lang = node.lang || 'plaintext'
			const code = node.value
			const attrs = getAttributes(node.meta)

			vfile.data.step = Math.max(asNumber(vfile.data.step, 0), asNumber(attrs.step, 0))

			const container = createContainer(lang, attrs)
			parent.children.splice(index, 1, container as RootContent)

			return {
				lang,
				code,
				container
			}
		})

		await Promise.all(
			codeblocks.map(async (block) => {
				if (!block) return
				const html = await highlight(block.lang, block.code)
				block.container.data?.hChildren?.push(html)
			})
		)
	}
}
