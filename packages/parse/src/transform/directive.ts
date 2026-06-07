import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import { parse } from 'yaml'

import { Directive } from '../types'

const DIRECTIVE_RE = /^<!--(global\s)?([\s\S]*)-->$/

function parseDirective(value: string): Directive | null {
	try {
		return parse(value) as Directive
	} catch {
		console.warn(`\x1b[43m\x1b[30m WARN \x1b[0m\x1b[33m directive syntax invalid:\x1b[0m\n---\n${value}\n---`)
		return null
	}
}

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

			const directive = parseDirective(match[2].trim())
			if (!directive) return

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
