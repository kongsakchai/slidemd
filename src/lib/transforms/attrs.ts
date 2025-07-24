import type { Parent, RootContentMap } from 'mdast'
import { parseAttributes, parseClass, parseId } from './helper'

export const processAttrs = (node: RootContentMap['html'], parent: Parent) => {
	const value = node.value.trim()

	parent.data = parent.data || {}
	parent.data.hProperties = {
		...parent.data.hProperties,
		...parseAttributes(value)
	}

	const className = parseClass(value)
	if (className) {
		parent.data.hProperties.class = `${className} ${parent.data.hProperties.class || ''}`.trim()
	}
	const id = parseId(value)
	if (id) {
		parent.data.hProperties.id = `${id} ${parent.data.hProperties.id || ''}`.trim()
	}
}
