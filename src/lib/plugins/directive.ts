import type { Root, RootContent, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'

const regexp = {
	attributes: /([^\s:]+):[\s]*(".*?"|[^\s]+)/g,
	quote: /^["']|["']$/g
}

// filter elements that have properties
// Properties are defined in the last child of the element in the form of HTML comments
const filterComments = (node: RootContent): boolean => {
	return node.type === 'html' && node.value.startsWith('<!--')
}

interface Directives {
	global: Record<string, string>
	local: Record<string, string>
}

const parseDirectives = (value: string): Directives => {
	const global: Record<string, string> = {}
	const local: Record<string, string> = {}

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

export const directivePlugin = () => {
	return (tree: Root, file: VFile) => {
		const children = tree.children.filter(filterComments)

		const directives = children.reduce(
			(acc, node) => {
				const { global, local } = parseDirectives((node as RootContentMap['html']).value)
				acc.global = { ...acc.global, ...global }
				acc.local = { ...acc.local, ...local }
				return acc
			},
			{ global: {}, local: {} }
		)

		file.data.directives = directives
	}
}
