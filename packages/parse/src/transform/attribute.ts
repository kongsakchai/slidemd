import { Data, Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { asNumber } from '../utils.js'
import { getAttributes } from './utils.js'

export function attributeTransformer(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, 'attribute', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			if (index != parent.children.length - 1) return

			const attrs = getAttributes(node.data)
			parent.data = { ...parent.data }
			parent.data.hProperties = {
				...parent.data.hProperties,
				...(attrs as Data['hProperties'])
			}
			parent.children.pop()

			vfile.data.step = Math.max(asNumber(vfile.data.step, 0), asNumber(attrs.step, 0))
		})
	}
}
