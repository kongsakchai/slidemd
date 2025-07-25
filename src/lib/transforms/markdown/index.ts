import { visit } from 'unist-util-visit'

import type { Node, Parent, Root, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { processAttrs } from './attrs'
import { appendBackgroundContainer, processBackground } from './background'
import { processCode } from './code'
import { processDirectives, type DirectiveContext } from './directives'
import { processImage } from './image'
import { regexp } from './parser'
import { processSplit } from './split'

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

export const slideTransform = () => {
	return (tree: Root, file: VFile) => {
		const directives: DirectiveContext = {
			global: {},
			local: {}
		}
		const splitIndex: number[] = []

		// Visit all HTM
		visit(tree, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			if (isComment(node)) {
				if (parent.type === 'root' && isSplit(node)) {
					// Process split directive
					splitIndex.push(index)
				} else if (parent.type === 'root') {
					// Process directives
					processDirectives(node, directives)
				} else if (index === parent.children.length - 1) {
					// Process attributes
					processAttrs(node, parent)
				}
			}
		})

		if (splitIndex.length > 0) {
			splitIndex.push(tree.children.length) // Add the end index for the last split
			const size = processSplit(splitIndex, tree)

			directives.local['split'] = true
			directives.local['splitSize'] = size

			tree.children.forEach((child) => elementTransform(child as Parent))
		} else {
			// Process the entire tree without splitting
			elementTransform(tree)
		}

		file.data.directives = directives
	}
}

const elementTransform = (root: Parent) => {
	// Visit Code
	visit(root, 'code', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return
		processCode(node, index as number, parent as Parent)
	})

	// Visit Image
	const background: Node[] = []
	visit(root, 'image', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		if (isBackground(node)) {
			const bg = processBackground(node, index, parent)
			background.push(bg)
			clearParent(root, parent)
			return
		}

		processImage(node, parent)
	})

	appendBackgroundContainer(background, root)
}

const clearParent = (root: Parent, parent?: Parent) => {
	while (true) {
		if (!parent) return

		if (parent.children.length > 0) {
			const empty = parent.children.every((child) => {
				return child.type === 'text' && child.value.trim() === ''
			})

			if (!empty) return
		}

		visit(root, parent, (_, index, parentNode) => {
			parentNode?.children.splice(index || -1, 1)
			parent = parentNode
		})
	}
}
