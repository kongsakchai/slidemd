import type { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { SlideContext } from '../types.js'

const RAW_TAG_REGEX = /^<(script|style)(?:\s[\s\S]*)?>([\s\S]*)<\/\1>$/i

export function extractScriptTransformer(): Transformer {
	return async (tree, vfile) => {
		const ctx = vfile.data.context as SlideContext

		visit(tree as Root, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const match = RAW_TAG_REGEX.exec(node.value)
			if (!match) return

			if (match[1].toLowerCase() === 'script') {
				ctx.script.push(match[2])
			} else {
				ctx.style.push(match[2])
			}

			parent.children.splice(index, 1)
			return index
		})
	}
}
