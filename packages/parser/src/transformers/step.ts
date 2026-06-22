import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { asNumber } from '../utils'

export function stepTransformer(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			if ('data' in node && node.data && 'hProperties' in node.data && node.data.hProperties) {
				let step = 0
				let isSteped = false
				for (const key in node.data.hProperties) {
					const match = /^step-(\d+)$/.exec(key)
					if (!match) continue
					step = Math.max(step, Number.parseInt(match[1]))
					isSteped = true
				}
				if (isSteped) {
					node.data.hProperties.step = step
					vfile.data.step = Math.max(asNumber(vfile.data.step, 0), step)
					// node.data.hProperties
				}
			}
		})
	}
}
