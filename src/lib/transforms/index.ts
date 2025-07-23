import { visit } from '@flex-development/unist-util-visit'
import type { Parent, Root, RootContent, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { processAttrs } from './attrs'
import { processDirectives } from './directives'
import { processImage } from './image'

export const isHtmlComment = (node: RootContentMap['html']): boolean => {
	// Check if the node is an HTML comment that starts with <!-- and ends with -->
	return node.value.startsWith('<!--') && node.value.endsWith('-->')
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

		const parentCheckList: Parent[] = []
		// Visit Image
		visit(tree, 'image', (node, index, parent) => {
			const data = processImage(node)
			if (data.isAbsolute) {
				if (index == undefined || !parent) return

				const extract = parent.children.splice(index, 1)
				appendAfter(tree, parent, ...extract)
			}
		})

		// Remove empty parents
		parentCheckList.forEach((parent) => {
			removeEmptyParent(tree, parent)
		})
	}
}

// Append After Parent
export const appendAfter = (tree: Root, node: Parent, ...append: RootContent[]) => {
	visit(tree, node, (_, index, parentNode) => {
		if (index !== undefined && parentNode) {
			parentNode.children.splice(index + 1, 0, ...append)
		}
	})
}

export const removeEmptyParent = (tree: Root, parent: Parent) => {
	if (parent.children.length > 0) return
	visit(tree, parent, (_, index, parentNode) => {
		if (index !== undefined && parentNode) {
			parentNode.children.splice(index, 1)
		}
	})
}
