import type { Parent, RootContentMap } from 'mdast'
import { parseAttributes, parseClass, parseId } from './helper'

export const processAttrs = (node: RootContentMap['html'], parent: Parent) => {
	const value = node.value.trim()

	parent.data = parent.data || {}
	parent.data.hProperties = {
		...parent.data.hProperties,
		...parseAttributes(value)
	}

	parent.data.hProperties.class = `${parent.data.hProperties.class || ''} ${parseClass(value)}`.trim()
	parent.data.hProperties.id = `${parent.data.hProperties.id || ''} ${parseId(value)}`.trim()

	return parent.data.hProperties
}
