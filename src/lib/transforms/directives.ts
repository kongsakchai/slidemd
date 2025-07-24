import type { RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { parseAttributes } from './helper'

type DirectiveMap = {
	global: Record<string, unknown>
	local: Record<string, unknown>
}

const parseDirectives = (value: string): DirectiveMap => {
	const global: Record<string, unknown> = {}
	const local: Record<string, unknown> = {}

	const attrs = parseAttributes(value)
	for (const [key, value] of Object.entries(attrs)) {
		// If the key starts with an underscore, it's a local property
		// Otherwise, it's a global property
		if (key.startsWith('_')) {
			local[key.slice(1)] = value
		} else {
			global[key] = value
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
}
