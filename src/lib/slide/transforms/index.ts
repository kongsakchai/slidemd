import { visit } from 'unist-util-visit'

import type { Node, Parent, Root, RootContent, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { makeBackgroundContainer, parseBackground } from './background'
import { parseImage } from './image'
import { join, parseAttributes, parseClass, parseId, parseSplit, regexp } from './parser'

export interface DirectiveStore {
	global: Record<string, unknown>
	local: Record<string, unknown>
}

const parseSplitSize = (node: RootContentMap['html']) => {
	const split = parseSplit(node.value)
	if (!split) {
		return '1fr'
	}

	return split
}

const parseAttrsToParent = (node: RootContentMap['html'], parent: Parent) => {
	const value = node.value.trim()

	parent.data ||= {}
	parent.data.hProperties = {
		...parent.data.hProperties,
		...parseAttributes(value)
	}

	parent.data.hProperties.class = parseClass(value, parent.data.hProperties.class as string)

	parent.data.hProperties.id = parseId(value, parent.data.hProperties.id as string)
}

const parseDirectivesToStore = (node: RootContentMap['html'], store: DirectiveStore) => {
	const global: Record<string, unknown> = {}
	const local: Record<string, unknown> = {}

	const attrs = parseAttributes(node.value)
	for (const [key, value] of Object.entries(attrs)) {
		// If the key starts with an underscore, it's a local property
		// Otherwise, it's a global property
		if (key.startsWith('_')) {
			local[key.slice(1)] = value
			continue
		}

		global[key] = value
	}

	store.global = { ...store.global, ...global }
	store.local = { ...store.local, ...local }
}

const handleHtml = (splitList: Map<number, string>, store: DirectiveStore) => {
	return (node: RootContentMap['html'], index?: number, parent?: Parent) => {
		if (typeof index !== 'number' || !parent) return

		if (regexp.comment.test(node.value)) {
			if (regexp.split.test(node.value)) {
				splitList.set(index, parseSplitSize(node))
				return
			}

			if (parent.type === 'root') {
				parseDirectivesToStore(node, store)
				return
			}

			if (index === parent.children.length - 1) {
				parseAttrsToParent(node, parent)
				return
			}
		}
	}
}

const handleImage = (root: Parent, bgList: Node[]) => {
	return (node: RootContentMap['image'], index?: number, parent?: Parent) => {
		if (typeof index !== 'number' || !parent) return

		if (regexp.bgKey.test(node.alt || '')) {
			const bg = parseBackground(node, index, parent, root)
			bgList.push(bg)
			return
		}

		parseImage(node, parent)
	}
}

const transformNode = (root: Parent) => {
	// Visit Code
	visit(root, 'code', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		if (node.lang === 'mermaid') {
			const html = `<pre class="mermaid">${node.value}</pre>`
			const newNode = {
				type: 'html',
				value: html
			}
			parent.children.splice(index, 1, newNode as RootContent)
		}
	})

	// Visit Image
	const bgList: Node[] = []
	visit(root, 'image', handleImage(root, bgList))

	if (bgList.length > 0) {
		const bgContainer = makeBackgroundContainer(bgList)
		root.children.push(bgContainer as RootContent)
	}
}

const makeSplitParent = (node: RootContent[]) => {
	return {
		type: 'split',
		children: node,
		data: {
			hProperties: {
				class: 'slide-child'
			}
		}
	} as Parent
}

const transformSplitNode = (root: Root, splitList: Map<number, string>, store: DirectiveStore) => {
	const parents: Parent[] = []

	const indexs = Array.from(splitList.keys())
	const sizes = Array.from(splitList.values())

	indexs.reduce((prevIndex, currentIndex) => {
		const children = root.children.slice(prevIndex, currentIndex + 1)
		const parent = makeSplitParent(children)

		transformNode(parent)
		parents.push(parent)

		return currentIndex + 1
	}, 0)

	root.children = parents as RootContent[]

	store.local['split'] = true
	store.local['splitSize'] = join(sizes, ' ')
}

export const slideTransform = () => {
	return (tree: Root, file: VFile) => {
		const splitList = new Map<number, string>()
		const store: DirectiveStore = { global: {}, local: {} }

		visit(tree, 'html', handleHtml(splitList, store))

		if (splitList.size == 0) {
			transformNode(tree)
		} else {
			splitList.set(tree.children.length, '1fr')
			transformSplitNode(tree, splitList, store)
		}

		file.data.directives = store
	}
}
