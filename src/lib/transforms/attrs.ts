import type { Parent, RootContentMap } from 'mdast'
import { parseAttributes, parseClass, parseId } from './parser'

export const processAttrs = (node: RootContentMap['html'], parent: Parent) => {
	const value = node.value.trim()

	parent.data = parent.data || {}
	parent.data.hProperties = {
		...parent.data.hProperties,
		...parseAttributes(value)
	}

	const baseClass = (parent.data.hProperties.class as string) || ''
	parent.data.hProperties.class = parseClass(value, baseClass)

	const baseId = (parent.data.hProperties.id as string) || ''
	parent.data.hProperties.id = parseId(value, baseId)
}
