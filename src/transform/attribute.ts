import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import { getAttributes } from './helper'

export function transformerAttribute(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, 'attribute', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const attrs = getAttributes(node.value)
			parent.data = { ...parent.data }
			parent.data.hProperties = {
				...parent.data.hProperties,
				...attrs
			}

			vfile.data.step = isNaN(vfile.data.step as number)
				? attrs.step
				: Math.max(attrs.step, vfile.data.step as number)
		})
	}
}
