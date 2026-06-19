import { Properties } from 'hast'
import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { asNumber } from '../utils'
import { extractMaxStep } from './utils'

export function attributeBlockTransformer(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, 'attributeBlock', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			if (index !== parent.children.length - 1) return

			parent.data = { ...parent.data }
			parent.data.hProperties = { ...parent.data.hProperties }
			for (const key in node.attr) {
				if (typeof node.attr[key] !== 'object') {
					parent.data.hProperties[key] = node.attr[key] as Properties[string]
				}
			}

			parent.data.hProperties.step = extractMaxStep(node.attr)
			vfile.data.step = Math.max(asNumber(vfile.data.step, 0), parent.data.hProperties.step)
		})
	}
}
