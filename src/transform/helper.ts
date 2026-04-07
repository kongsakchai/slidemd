import { Node } from 'unist'
import { BuildVisitor, visit, type Test } from 'unist-util-visit'

// attribute extractor, used for parsing attributes in code blocks and slide containers
// it's start of string or whitespace
// followed by key, which can be word characters, hyphen, colon or at sign and must start with a letter
// optionally followed by = and value, which can be in double quotes, single quotes or unquoted
// it's end of string or whitespace
const ATTR_REGEX = /(?<=^|\s)([a-zA-Z][\w-@:]+)(?:="([\s\S]*?)"|='([\s\S]*?)'|=([^\s]+?))?(?=\s|$)/g

export const extractAttributes = (str?: string | null): Record<string, any> => {
	if (!str) return {}
	const attrs: Record<string, any> = {}
	for (const match of str.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[2] || match[3] || match[4] || true
		attrs[key] = value
	}
	return attrs
}

// class extractor, used for parsing class names in code blocks and slide containers
// it's start of string or whitespace
// followed by a dot and class name, which can be any characters except whitespace
// it's end of string or whitespace
const CLASS_REGEX = /(?<=^|\s)\.([^\s]+)(?=\s|$)/g

export const extractClassNames = (str?: string | null) => {
	if (!str) return []
	return Array.from(str.matchAll(CLASS_REGEX), (m) => m[1])
}

const ID_REGEX = /(?<=^|\s)#([^\s]+)(?=\s|$)/g

export const extractIDs = (str?: string | null) => {
	if (!str) return []
	return Array.from(str.matchAll(ID_REGEX), (m) => m[1])
}

export const mapNode = <Tree extends Node, Check extends Test, T>(
	tree: Tree,
	test: Check,
	visitor: (...args: Parameters<BuildVisitor<Tree, Check>>) => T
) => {
	const results: T[] = []
	visit(tree, test, (node, index, parent) => {
		results.push(visitor(node, index, parent))
	})
	return results
}
