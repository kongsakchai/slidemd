import { visit } from 'unist-util-visit'

import type { Node, Parent, Root, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { processAttrs } from './attrs'
import { appendBackgroundContainer, processBackground } from './background'
import { processDirectives } from './directives'
import { processImage } from './image'
import { regexp } from './parser'

export const isHtmlComment = (node: RootContentMap['html']): boolean => {
	// Check if the node is an HTML comment that starts with <!-- and ends with -->
	return node.value.startsWith('<!--') && node.value.endsWith('-->')
}

export const isImageBackground = (node: RootContentMap['image']): boolean => {
	// Check if the image node's alt text matches the background image pattern
	return regexp.bgKey.test(node.alt || '')
}

export const slideTransform = () => {
	return (tree: Root, file: VFile) => {
		// Visit all HTM
		visit(tree, 'html', (node, _, parent) => {
			if (isHtmlComment(node) && parent?.type != 'root') {
				processAttrs(node, parent as Parent)
			} else if (isHtmlComment(node) && parent?.type === 'root') {
				processDirectives(node, file)
			}
		})

		// Visit Image
		const background: Node[] = []
		visit(tree, 'image', (node, _, parent) => {
			if (isImageBackground(node)) {
				const bg = processBackground(node, parent as Parent)
				background.push(bg)
				emptyParent(parent as Parent, tree)
				return
			}

			processImage(node, parent as Parent)
		})

		appendBackgroundContainer(background, tree)
	}
}

const emptyParent = (parent: Parent, tree: Root) => {
	while (true) {
		if (!parent || parent.children.length > 0) return
		visit(tree, parent, (_, index, parentNode) => {
			parentNode?.children.splice(index || -1, 1)
			parent = parentNode as Parent
		})
	}
}
