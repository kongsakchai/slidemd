import { visit } from 'unist-util-visit'

import type { Node, Parent, Root, RootContent, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { processAttrs } from './attrs'
import { makeBackgroundContainer, processBackground } from './background'
import { processCode } from './code'
import { processDirectives, type DirectiveContext as DirectiveStore } from './directives'
import { processImage } from './image'
import { join, regexp } from './parser'
import { makeSplitParent, processSplit } from './split'

export const isComment = (node: RootContentMap['html']): boolean => {
	// Check if the node is an HTML comment that starts with <!-- and ends with -->
	return regexp.comment.test(node.value)
}

export const isBackground = (node: RootContentMap['image']): boolean => {
	// Check if the image node's alt text matches the background image pattern
	return regexp.bgKey.test(node.alt || '')
}

export const isSplit = (node: RootContentMap['html']): boolean => {
	// Check if the HTML comment node contains a split directive
	return regexp.split.test(node.value)
}

const htmlComment = (splitList: Map<number, string>, store: DirectiveStore) => {
	return (node: RootContentMap['html'], index?: number, parent?: Parent) => {
		if (typeof index !== 'number' || !parent) return

		if (isComment(node)) {
			if (isSplit(node)) {
				splitList.set(index, processSplit(node))
				return
			}

			if (parent.type === 'root') {
				processDirectives(node, store)
				return
			}

			if (index === parent.children.length - 1) {
				processAttrs(node, parent)
				return
			}
		}
	}
}

export const slideTransform = () => {
	return (tree: Root, file: VFile) => {
		const splitList = new Map<number, string>()
		const store: DirectiveStore = { global: {}, local: {} }

		visit(tree, 'html', htmlComment(splitList, store))

		if (splitList.size > 0) {
			transformNode(tree)
		} else {
			const roots: Parent[] = []
			splitList.set(tree.children.length, '1fr')

			const indexs = Array.from(splitList.keys())
			const sizes = Array.from(splitList.values())

			indexs.reduce((prevIndex, currentIndex) => {
				const children = tree.children.slice(prevIndex, currentIndex + 1)
				const root = makeSplitParent(children)

				transformNode(root)
				roots.push(root)

				return currentIndex + 1
			}, 0)

			tree.children = roots as RootContent[]
			store.local['split'] = true
			store.local['splitSize'] = join(sizes, ' ')
		}

		file.data.directives = store
	}
}

const image = (root: Parent, bgList: Node[]) => {
	return (node: RootContentMap['image'], index?: number, parent?: Parent) => {
		if (typeof index !== 'number' || !parent) return

		if (isBackground(node)) {
			const bg = processBackground(node, index, parent, root)
			bgList.push(bg)
			return
		}

		processImage(node, parent)
	}
}

const transformNode = (root: Parent) => {
	// Visit Code
	visit(root, 'code', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		processCode(node, index, parent)
	})

	// Visit Image
	const bgList: Node[] = []
	visit(root, 'image', image(root, bgList))

	const bgContainer = makeBackgroundContainer(bgList)
	root.children.push(bgContainer as RootContent)
}
