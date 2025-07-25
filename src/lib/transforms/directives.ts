import type { RootContentMap } from 'mdast'
import { parseAttributes } from './parser'

export interface DirectiveContext {
	global: Record<string, unknown>
	local: Record<string, unknown>
}

const parseDirectives = (value: string): DirectiveContext => {
	const global: Record<string, unknown> = {}
	const local: Record<string, unknown> = {}

	const attrs = parseAttributes(value)
	for (const [key, value] of Object.entries(attrs)) {
		// If the key starts with an underscore, it's a local property
		// Otherwise, it's a global property
		if (key.startsWith('_')) {
			local[key.slice(1)] = value
			continue
		}

		global[key] = value
	}

	return { global, local }
}

export const processDirectives = (node: RootContentMap['html'], base: DirectiveContext) => {
	const { global, local } = parseDirectives(node.value)

	base.global = { ...base.global, ...global }
	base.local = { ...base.local, ...local }
}
