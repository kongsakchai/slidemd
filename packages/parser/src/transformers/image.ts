import { Properties } from 'hast'
import { Image, Parent, Root } from 'mdast'
import type { Transformer } from 'unified'
import { EXIT, visit } from 'unist-util-visit'

import { asString } from '../utils.js'

export function imageTransformer(): Transformer {
	return (tree) => {
		visit(tree as Root, 'image', (node, index, parent) => {
			if (typeof index !== 'number' || !parent || node.data?.processed) return
			node.data ??= {}
			node.data.processed = true

			applyImageStyles(node.data.hProperties)
			hoistImageToParent(tree as Root, node, index, parent)
		})
	}
}

const DEFAULT_FILTER_ATTRIBUTE: Record<string, string | number> = {
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

const OBJECT_FIT_ATTRIBUTE = ['fill', 'contain', 'cover', 'scale-down']

const STYLE_ATTRIBUTE: Record<string, string> = {
	w: 'width',
	h: 'height'
}

const isStringOrNumber = (val: unknown) => typeof val === 'string' || typeof val === 'number'

const ABSOLUTE_CLASS = /[^|\s]absolute[$|\s]/
const ABSOLUTE_STYLE = /[^|\s]display:\s?absolute[$|\s]/

const isFloating = (props?: Properties) => {
	if (!props) return false

	return props.bg || asString(props.class)?.search(ABSOLUTE_CLASS) || asString(props.class)?.search(ABSOLUTE_STYLE)
}

function applyImageStyles(props?: Properties) {
	if (!props) return

	const styles = [props.styles].filter(Boolean)
	const classNames = [props.class].filter(Boolean)

	if (props.bg != null) classNames.push('slide-background')

	for (const [key, cssKey] of Object.entries(STYLE_ATTRIBUTE)) {
		if (isStringOrNumber(props[key])) {
			styles.push(`${cssKey}:${props[key]}`)
			delete props[key]
		}
	}
	for (const key of OBJECT_FIT_ATTRIBUTE) {
		if (props[key] != null) {
			styles.push(`object-fit:${key}`)
			delete props[key]
			break
		}
	}

	const filters: string[] = []
	for (const [key, defaultVal] of Object.entries(DEFAULT_FILTER_ATTRIBUTE)) {
		if (isStringOrNumber(props[key])) {
			filters.push(`${key}(${props[key] || defaultVal})`)
			delete props[key]
		}
	}
	if (filters.length > 0) {
		styles.push(`filter:${filters.join(' ')}`)
	}
	if (styles.length > 0) props.style = styles.join(';') || undefined
	if (classNames.length > 0) props.class = classNames.join(' ') || undefined
}

function hoistImageToParent(tree: Root, image: Image, index: number, parent: Parent) {
	if (!isFloating(image.data?.hProperties)) return

	parent.children.splice(index, 1)

	visit(tree, parent, (parent, index, parentOfParent) => {
		if (typeof index !== 'number' || !parentOfParent) return

		if (parent.children.length === 0) {
			parentOfParent.children.splice(index, 1, image)
		} else {
			parentOfParent.children.splice(index, 0, image)
		}

		return EXIT
	})
}
