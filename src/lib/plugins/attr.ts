import type { Parent, Root, RootContent, RootContentMap } from 'mdast'

const regexp = {
	parseAttributes: /([^\s=]+)=(".*?"|[^\s]+)/g,
	quote: /^["']|["']$/g,
	shortClass: /\.[^\s]+/g,
	shortId: /#[^\s]+/g
}

// filter elements that have attributes
// Attributes are defined in the last child of the element in the form of HTML comments
const filterAttributes = (node: RootContent): boolean => {
	if (node.type === 'html') return false

	const isParent = 'children' in node && Array.isArray(node.children)
	if (!isParent) return false
	if (node.children.length <= 1) return false

	const lastChild = node.children[node.children.length - 1]
	return lastChild.type === 'html' && lastChild.value.startsWith('<!--')
}

// Extracts IDs from a string, ignoring the leading hash
// This handles cases where IDs are defined in attributes like #id-name
const shortId = (value: string) => {
	return value.match(regexp.shortId)?.map((id) => id.slice(1))
}

// Extracts class names from a string, ignoring the leading dot
// This handles cases where class names are defined in attributes like .class-name
const shortClass = (value: string) => {
	return value.match(regexp.shortClass)?.map((className) => className.slice(1))
}

const parseAttributes = (value: string): Record<string, string> => {
	const attrs: Record<string, string> = {}

	for (const match of value.matchAll(regexp.parseAttributes)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		attrs[key] = val
	}

	return attrs
}

export const attrPlugin = () => {
	return (tree: Root) => {
		const children = tree.children.filter(filterAttributes)
		children.forEach((node) => {
			const parent = node as Parent
			const lastChild = parent.children.pop() as RootContentMap['html']

			node.data = node.data || {}
			node.data.hProperties = {
				...node.data.hProperties,
				...parseAttributes(lastChild.value)
			}

			const classNames = shortClass(lastChild.value)?.join(' ')
			if (classNames) {
				const oldClass = node.data.hProperties.class || ''
				node.data.hProperties.class = `${classNames} ${oldClass}`.trim()
			}

			const ids = shortId(lastChild.value)?.join(' ')
			if (ids) {
				const oldId = node.data.hProperties.id || ''
				node.data.hProperties.id = `${ids} ${oldId}`.trim()
			}
		})
	}
}
