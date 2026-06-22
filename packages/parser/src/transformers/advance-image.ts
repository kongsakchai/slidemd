import { Properties } from 'hast'
import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { EXIT, visit } from 'unist-util-visit'

import { asString } from '../utils'

export function advanceImageTransformer(): Transformer {
	return (tree) => {
		visit(tree as Root, 'image', (node, index, parent) => {
			if (typeof index !== 'number' || !parent || node.data?.processed) return

			if (node.data?.hProperties) {
				node.data.processed = true
				processImageProperties(node.data.hProperties)
			}

			// check if absolute image
			if (
				(node.data?.hProperties?.bg !== null && node.data?.hProperties?.bg !== undefined) ||
				(node.data?.hProperties?.absolute !== null && node.data?.hProperties?.absolute !== undefined)
			) {
				parent.children.splice(index, 1)
				visit(tree as Root, parent, (parent, index, parentOfParent) => {
					if (typeof index !== 'number' || !parentOfParent) return

					if (parent.children.length === 0) {
						parentOfParent.children.splice(index, 1, node)
					} else {
						parentOfParent.children.splice(index, 0, node)
					}

					return EXIT
				})
			}
		})
	}
}

const DEFAULT_FILTER_VALUES: Record<string, string | number> = {
	blur: '10px',
	brightness: 1.5,
	contrast: 2,
	grayscale: 1,
	'hue-rotate': '180deg',
	invert: 1,
	opacity: 0.5,
	saturate: 2,
	sepia: 1
}

function isFilterKey(key: string): key is keyof typeof DEFAULT_FILTER_VALUES {
	return key in DEFAULT_FILTER_VALUES
}

function buildFilterValue(key: string, value: unknown): string {
	const resolved = value || DEFAULT_FILTER_VALUES[key]
	return `${key}(${resolved})`
}

function processImageProperties(p: Properties): void {
	const styles = parseStyles(p.style)
	const classNames: string[] = [asString(p.class, '')]
	const filters: string[] = []

	if (p.w) {
		styles.push(`width:${asString(p.w, '')}`)
		delete p.w
	}
	if (p.h) {
		styles.push(`height:${asString(p.h, '')}`)
		delete p.h
	}
	if (p.absolute != null && p.absolute !== undefined) {
		classNames.push('absolute')
	}
	if (p.bg != null && p.bg !== undefined) {
		classNames.push('slide-background')
	}

	for (const key of Object.keys(p)) {
		if (isFilterKey(key)) {
			filters.push(buildFilterValue(key, p[key]))
			delete p[key]
		}
	}

	if (filters.length > 0) {
		styles.push(`filter:${filters.join(' ')}`)
	}

	p.style = styles.join(';').trim() || undefined
	p.class = classNames.filter(Boolean).join(' ') || undefined
}

function parseStyles(s: unknown): string[] {
	const str = asString(s, '').replace(/;$/, '')
	return str ? [str] : []
}
