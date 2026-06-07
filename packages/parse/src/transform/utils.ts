import { Node } from 'unist'
import { BuildVisitor, type Test, visit } from 'unist-util-visit'

import { Attribute } from '../types.js'
import { asString } from '../utils.js'

// attribute extractor, used for parsing attributes in string
// it's start of string or whitespace
// followed by key, which can be word characters, hyphen, colon or at sign and must start with a letter
// optionally followed by = and value, which can be in double quotes, single quotes or unquoted
// it's end of string or whitespace
const ATTR_REGEX = /(?<=^|\s)([a-zA-Z][\w-@:]+)(?:="(.*?)"|='(.*?)'|=({.*?})|=([^\s]+?))?(?=\s|$)/g

export const extractAttributes = (str?: string | null): Attribute => {
	if (!str) return {}
	const attrs: Attribute = {}
	for (const match of str.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[2] || match[3] || match[4] || match[5] || ''
		attrs[key] = value
	}
	return attrs
}

// class extractor, used for parsing class names in string
// it's start of string or whitespace
// followed by a dot and class name, which can be any characters except whitespace
// it's end of string or whitespace
const CLASS_REGEX = /(?<=^|\s)\.([^\s]+)(?=\s|$)/g

export const extractClassNames = (str?: string | null) => {
	if (!str) return []
	return Array.from(str.matchAll(CLASS_REGEX), (m) => m[1])
}

// id extractor, used for parsing id name in string
// it's start of string of whitespace
// followed by a numberSign and id name, which can be any characters except whitespace
// it's end of string or whitespace
const ID_REGEX = /(?<=^|\s)#([^\s]+)(?=\s|$)/g

export const extractIDs = (str?: string | null) => {
	if (!str) return []
	return Array.from(str.matchAll(ID_REGEX), (m) => m[1])
}

export const extractMaxStep = (attr: Attribute) => {
	let step = 0
	for (const key in attr) {
		const match = /^step-(\d+)$/.exec(key)
		if (match) {
			step = Math.max(step, Number.parseInt(match[1]))
		}
	}
	return step
}

export const getAttributes = (str?: string | null) => {
	const attrs = extractAttributes(str)

	const ids = extractIDs(str)
	ids.push(asString(attrs.id, ''))
	attrs.id = ids.filter(Boolean).join(' ')
	if (!attrs.id) delete attrs.id

	const className = extractClassNames(str)
	className.push(asString(attrs.class, ''))
	attrs.class = className.filter(Boolean).join(' ')
	if (!attrs.class) delete attrs.class

	attrs.step = extractMaxStep(attrs)
	if (!attrs.step) delete attrs.step

	return attrs
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
