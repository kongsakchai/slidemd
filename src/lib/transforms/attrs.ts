import type { RootContentMap } from 'mdast'
import { parseClass, parseId } from './helper'
import { regexp } from './regexp'

// Parses attributes from a string and returns them as an object
// This handles cases where attributes are defined in HTML comments like <!-- attr: value -->
// It extracts key-value pairs and returns them as an object
// - For example, \<!-- attr1: value1 attr2: value2 --> will return { attr1: 'value1', attr2: 'value2' }
// - For example, \<!-- attr1: "value1-1 value1-2" attr2: "value2" --> will return { attr1: 'value1-1 value1-2', attr2: 'value2' }
// - It also handles cases where attributes are defined in the form of key="value" or key='value'
// - For example, \<!-- attr1="value1" attr2='value2' --> will also return { attr1: 'value1', attr2: 'value2' }
const parseAttributes = (value: string): Record<string, string> => {
	const attrs: Record<string, string> = {}

	for (const match of value.matchAll(regexp.attributes)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		attrs[key] = val
	}

	return attrs
}

export const processAttrs = (node: RootContentMap['html']) => {
	node.data = node.data || {}
	node.data.hProperties = {
		...node.data.hProperties,
		...parseAttributes(node.value)
	}

	node.data.hProperties.class = parseClass(node.value) || node.data.hProperties.class
	node.data.hProperties.id = parseId(node.value) || node.data.hProperties.id

	return node.data.hProperties
}
