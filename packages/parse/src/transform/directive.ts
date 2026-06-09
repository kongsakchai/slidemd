import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Directive } from '../types'
import { parseYAML } from '../utils'

const DIRECTIVE_RE = /^<!--(global\s)?([\s\S]*)-->$/

function mergeDirective(current: Directive | undefined, source: Directive): Directive {
	return current ? { ...current, ...source } : { ...source }
}

export function directiveTransformer(): Transformer {
	return (tree, vfile) => {
		const data = { ...vfile.data } as { global: Directive | undefined; local: Directive | undefined }

		visit(tree as Root, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent || parent !== tree) return

			const match = DIRECTIVE_RE.exec(node.value)
			if (!match) return

			const directive = parseYAML(match[2].trim())
			if (!directive || Object.keys(directive).length === 0) return

			if (match[1]) {
				data.global = mergeDirective(data.global, directive)
			} else {
				data.local = mergeDirective(data.local, directive)
			}

			parent.children.splice(index, 1)
			return index
		})

		vfile.data = data
	}
}
