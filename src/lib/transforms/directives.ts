import type { RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { regexp } from './helper'

type DirectiveMap = {
	global: Record<string, unknown>
	local: Record<string, unknown>
}

// Parses directives from a string and returns them as an object.
// This handles cases where directives are defined in HTML comments like <!-- key: value -->
// It extracts key-value pairs and returns them as an object.
// - For example, \<!-- key1: value1 key2: value2 --> will return { key1: 'value1', key2: 'value2' }
// - It also handles cases where directives are defined in the form of key="value" or key='value'
// - For example, \<!-- key1="value1" key2='value2' --> will also return { key1: 'value1', key2: 'value2' }
const parseDirectives = (value: string): DirectiveMap => {
	const global: Record<string, unknown> = {}
	const local: Record<string, unknown> = {}

	for (const match of value.matchAll(regexp.attributes)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')

		// If the key starts with an underscore, it's a local property
		// Otherwise, it's a global property
		if (key.startsWith('_')) {
			local[key.slice(1)] = val
		} else {
			global[key] = val
		}
	}

	return { global, local }
}

export const processDirectives = (node: RootContentMap['html'], file: VFile) => {
	const { global, local } = parseDirectives(node.value)

	const directives = (file.data.directives || {}) as DirectiveMap
	directives.global = { ...directives.global, ...global }
	directives.local = { ...directives.local, ...local }
	file.data.directives = directives

	return directives
}
