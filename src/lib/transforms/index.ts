import { visit } from 'unist-util-visit'

import type { Node, Parent, Root, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { processAttrs } from './attrs'
import { appendBackgroundContainer, processBackground } from './background'
import { processDirectives, type DirectiveContext } from './directives'
import { processImage } from './image'
import { regexp } from './parser'
import { processSplit } from './split'

export const isHtmlComment = (node: RootContentMap['html']): boolean => {
	// Check if the node is an HTML comment that starts with <!-- and ends with -->
	return node.value.startsWith('<!--') && node.value.endsWith('-->')
}

export const isImageBackground = (node: RootContentMap['image']): boolean => {
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
			if (isHtmlComment(node)) {
				if (parent && parent.type === 'root' && isSplit(node)) {
					// Process split directive
					if (index !== undefined) {
						splitIndex.push(index)
					}
				} else if (parent && parent.type === 'root') {
					// Process directives
					processDirectives(node, directives)
				} else if (parent && index === parent.children.length - 1) {
					// Process attributes
					processAttrs(node, parent as Parent)
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
	// Visit Image
	const background: Node[] = []
	visit(root, 'image', (node, _, parent) => {
		if (isImageBackground(node)) {
			const bg = processBackground(node, parent as Parent)
			background.push(bg)
			clearParent(parent as Parent, root)
			return
		}

		processImage(node, parent as Parent)
	})

	appendBackgroundContainer(background, root)
}

const clearParent = (parent: Parent, root: Parent) => {
	while (true) {
		if (!parent || parent.children.length > 0) {
			const empty = parent.children.every((child) => {
				return child.type === 'text' && child.value.trim() === ''
			})

			if (!empty) return
		}

		visit(root, parent, (_, index, parentNode) => {
			parentNode?.children.splice(index || -1, 1)
			parent = parentNode as Parent
		})
	}
}
