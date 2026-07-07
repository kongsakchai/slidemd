import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { SlideContext } from '../types.js'
import { parseYAML } from '../utils.js'

const DIRECTIVE_REGEX = /^<!--(global\s)?([\s\S]*)-->$/

export function directiveTransformer(): Transformer {
	return (tree, vfile) => {
		const ctx = vfile.data.context as SlideContext

		visit(tree as Root, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent || parent !== tree) return

			const page = ctx.slides.findLast((p) => index >= p.breakIndex)
			if (!page) return

			const match = DIRECTIVE_REGEX.exec(node.value)
			if (!match) return

			const directive = parseYAML(match[2].trim())
			if (!directive || Object.keys(directive).length === 0) return

			if (match[1]) {
				page.global = { ...page.global, ...directive }
			} else {
				page.local = { ...page.local, ...directive }
			}

			parent.children.splice(index, 1)
			return index
		})
	}
}
