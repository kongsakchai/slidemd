import { visit } from 'unist-util-visit'

import type { Element } from 'hast'
import type { Node, Parent, Root, RootContent, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import { transformBackground } from './background'
import { transformImage } from './image'
import { join, parseAttributes, parseClass, parseId, parseSplit, regexp } from './parser'
import { transformShiki } from './shiki'

export interface DirectiveStore {
	global: Record<string, unknown>
	local: Record<string, unknown>
}

export const directiveStore = () => {
	return (tree: Root, file: VFile) => {
		const store: DirectiveStore = { global: {}, local: {} }
		file.data.directives = store
	}
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

const getStore = (file: VFile): DirectiveStore => {
	if (!file.data.directives) {
		return { global: {}, local: {} }
	}
	return file.data.directives as DirectiveStore
}

export const htmlTransformer = () => {
	return (tree: Root, file: VFile) => {
		const store = getStore(file)

		visit(tree, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			if (regexp.comment.test(node.value)) {
				if (parent.type === 'root') {
					parseDirectivesToStore(node, store)
					return
				}

				if (index === parent.children.length - 1) {
					parseAttrsToParent(node, parent)
					return
				}
			}
		})

		file.data.directives = store
	}
}

export const splitTransformer = () => {
	return (tree: Root, file: VFile) => {
		const indexs: number[] = []
		const slizes: string[] = []

		visit(tree, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			if (regexp.comment.test(node.value) && regexp.split.test(node.value)) {
				const size = parseSplit(node.value)
				indexs.push(index)
				slizes.push(size || '1fr')
				return
			}
		})

		if (indexs.length === 0) {
			return
		}

		indexs.push(tree.children.length)
		slizes.push('1fr')

		const parents: Parent[] = []
		indexs.reduce((prevIndex, currentIndex) => {
			const children = tree.children.slice(prevIndex, currentIndex + 1)
			const parent = {
				type: 'parent',
				children: children as RootContent[],
				data: {
					hProperties: {
						class: 'slide-child'
					}
				}
			}
			parents.push(parent)

			return currentIndex + 1
		}, 0)

		tree.children = parents as RootContent[]

		const store = getStore(file)
		store.local['split'] = true
		store.local['splitSize'] = join(slizes, ' ')

		file.data.directives = store
	}
}

const clearParent = (root: Parent, parent: Parent) => {
	let loop = true

	while (loop) {
		if (parent.children.length > 0) {
			const emptyChildren = parent.children.every((child) => {
				return child.type === 'text' && child.value.trim() === ''
			})

			if (!emptyChildren) return
		}

		visit(root, parent, (_, index, parentNode) => {
			if (typeof index !== 'number' || !parentNode) {
				loop = false
				return
			}

			parentNode.children.splice(index, 1)
			parent = parentNode
		})
	}
}

const setContentsParent = (parent: Parent) => {
	const isContents = parent.children.every((child) => {
		return child.type === 'image' && child.data?.hProperties?.isAbsolute
	})
	if (!isContents) return

	parent.data ||= {}
	const styles = [parent.data.hProperties?.style as string, 'display: contents']

	parent.data.hProperties = {
		...parent.data.hProperties,
		style: join(styles, '; ')
	}
}

const makeBackgroundContainer = (images: Node[]) => {
	const className = 'background-container'
	const isVertical = images.some((image) => image.data?.hProperties?.isVertical)
	const sizeGrids = images.map((image) => image.data?.hProperties?.sizeGrid || '1fr')
	const gridTemplate = (isVertical ? '--bg-rows: ' : '--bg-columns: ') + sizeGrids.join(' ')

	return {
		type: 'bg-container',
		data: {
			hProperties: {
				class: className,
				style: gridTemplate
			}
		},
		children: images as RootContent[]
	}
}

export const imageTransformer = () => {
	return (tree: Root, file: VFile) => {
		const store = getStore(file)
		const isSplit = store.local['split'] as boolean

		const roots = isSplit ? (tree.children as Parent[]) : [tree]

		roots.forEach((root) => {
			const backgrounds: Node[] = []

			visit(root, 'image', (node, index, parent) => {
				if (typeof index !== 'number' || !parent) return

				if (regexp.bgKey.test(node.alt || '')) {
					const bg = transformBackground(node)
					backgrounds.push(bg)

					parent.children.splice(index, 1)
					clearParent(root, parent)
					return
				}

				transformImage(node)
				setContentsParent(parent)
			})

			if (backgrounds.length > 0) {
				const bgContainer = makeBackgroundContainer(backgrounds)
				root.children.push(bgContainer as RootContent)
			}
		})
	}
}

export const codeTransformer = () => {
	return (tree: Root) => {
		visit(tree, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			if (node.lang === 'mermaid') {
				const html = `<pre class="mermaid">${node.value}</pre>`
				const newNode = {
					type: 'html',
					value: html
				}
				parent.children.splice(index, 1, newNode as RootContent)
				return
			}

			node.meta = node.lang
		})
	}
}

export const enhanceCodeTransformer = () => {
	return async (tree: Root) => {
		const preElements: Element[] = []

		visit(tree, { tagName: 'pre' }, (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			preElements.push(node as Element)
		})

		for (const pre of preElements) {
			await transformShiki(pre)
		}
	}
}
