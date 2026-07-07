import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { SlideContext } from '../types.js'

export const PAGE_BREAK_KEY = '\n---page-break---\n'

export function pageBreakTransformer(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, 'thematicBreak', (_, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			if (parent !== tree) return

			const ctx = vfile.data.context as SlideContext
			ctx.slides.push({ breakIndex: index })

			parent.children.splice(index, 1, {
				type: 'text',
				value: PAGE_BREAK_KEY
			})
		})
	}
}
