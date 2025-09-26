import { visit } from 'unist-util-visit'

import type { Element, Root as HRoot } from 'hast'
import type { Node, Parent, Root, RootContent, RootContentMap } from 'mdast'
import type { VFile } from 'vfile'
import type { Directive, SplitProperties } from '../types'
import { transformBackground } from './background'
import { transformImage } from './image'
import { join, Parser } from './parser'
import { transformShiki } from './shiki'

export interface Store {
	globalDirective: Directive
	localDirective: Directive
	split: SplitProperties
	click: number
}

export const initStore = () => {
	return (tree: Root, file: VFile) => {
		const store: Store = { globalDirective: {}, localDirective: {}, split: {}, click: 0 }
		file.data.store = store
	}
}

export const reservedWord = ['split']

const parseAttrsToParent = (node: RootContentMap['html'], parent: Parent) => {
	const value = node.value.trim()
	const parser = new Parser(value)

	parent.data ??= {}
	parent.data.hProperties = {
		...parent.data.hProperties,
		...parser.parseAttributes()
	}

	parent.data.hProperties.class = parser.parseClass(parent.data.hProperties.class as string)
	parent.data.hProperties.id = parser.parseId(parent.data.hProperties.id as string)
}

const parseDirectivesToStore = (node: RootContentMap['html'], store: Store) => {
	const global: Record<string, unknown> = {}
	const local: Record<string, unknown> = {}
	const parser = new Parser(node.value)

	const attrs = parser.parseAttributes()
	for (const [key, value] of Object.entries(attrs)) {
		if (reservedWord.includes(key)) continue

		// If the key starts with an underscore, it's a local property
		// Otherwise, it's a global property
		if (key.startsWith('_')) {
			local[key.slice(1)] = value
			continue
		}

		global[key] = value
	}

	store.globalDirective = { ...store.globalDirective, ...global }
	store.localDirective = { ...store.localDirective, ...local }
}

const getStore = (file: VFile): Store => {
	if (!file.data.store) {
		return { globalDirective: {}, localDirective: {}, split: {}, click: 0 }
	}
	return file.data.store as Store
}

export const htmlTransformer = () => {
	return (tree: Root, file: VFile) => {
		const store = getStore(file)

		visit(tree, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			if (Parser.isComment(node.value)) {
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

		file.data.store = store
	}
}

export const splitTransformer = () => {
	return (tree: Root, file: VFile) => {
		const indexs: number[] = []
		const slizes: string[] = []

		visit(tree, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			if (Parser.isComment(node.value) && Parser.isSplit(node.value)) {
				const size = new Parser(node.value).parseSplit()
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
						class: 'split-contents'
					}
				}
			}
			parents.push(parent)

			return currentIndex + 1
		}, 0)

		tree.children = parents as RootContent[]

		const store = getStore(file)
		store.split.split = true
		store.split.size = join(slizes, ' ')

		file.data.store = store
	}
}

const removeEmptyParent = (root: Parent, parent: Parent) => {
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

	const styles = [parent.data?.hProperties?.style as string, 'display: contents']

	parent.data ??= {}
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
		const isSplit = store.split.split as boolean

		const roots = isSplit ? (tree.children as Parent[]) : [tree]

		roots.forEach((root) => {
			const backgrounds: Node[] = []

			visit(root, 'image', (node, index, parent) => {
				if (typeof index !== 'number' || !parent) return

				if (Parser.isBackground(node.alt || '')) {
					const bg = transformBackground(node)
					backgrounds.push(bg)

					parent.children.splice(index, 1)
					removeEmptyParent(root, parent)
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

const escapeCode = (str: string) => {
	return str.replace(/[&<>{}]/g, (char) => `{'${char}'}`)
}

export const codeTransformer = () => {
	return (tree: Root) => {
		visit(tree, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const parser = new Parser(node.meta || '')
			const attrs = parser.parseAttributes()
			attrs.id = parser.parseId(attrs.id as string)
			attrs.class = parser.parseClass(attrs.class as string)

			if (node.lang === 'mermaid') {
				attrs.class = join(['mermaid', attrs.class], ' ')

				const mermaid = {
					type: 'text',
					value: escapeCode(node.value)
				}
				const container = {
					type: 'parent',
					data: {
						hProperties: {
							...attrs
						}
					},
					children: [mermaid]
				}
				parent.children.splice(index, 1, container as RootContent)
				return
			}

			node.meta = node.lang || 'plaintext'
			attrs.class = join([`language-${node.meta}`, attrs.class], ' ')

			const btn = {
				type: 'html',
				value: `<button class="copy"></button>`
			}
			const lang = {
				type: 'html',
				value: `<span class="lang">${node.lang || ''}</span>`
			}

			const container: Parent = {
				type: 'parent',
				data: {
					hProperties: {
						...attrs
					}
				},
				children: [btn, lang, node] as RootContent[]
			}
			parent.children.splice(index, 1, container as RootContent)
		})
	}
}

export const clickTransformer = () => {
	return (tree: Root, file: VFile) => {
		let clickInPage = 0

		visit(tree, (node) => {
			// click=n:"class1 class2"
			// click=1:opacity-100
			const clickValue = (node.data?.hProperties?.click || '') as string
			if (!clickValue) return

			const newClickValues: string[] = []
			const parser = new Parser(clickValue)

			const click = parser.parseClick()
			Object.entries(click).forEach(([key, value]) => {
				parser.newValue(value || '')

				const classes = parser.parseClass()
				if (!classes) return
				newClickValues.push(`${key}:${classes}`)

				if (clickInPage < Number(key)) {
					clickInPage = Number(key)
				}
			})

			if (Object.keys(click).length === 0 && clickValue) {
				const index = parseInt(clickValue)

				if (isNaN(index)) {
					const classes = parser.parseClass()
					if (classes) newClickValues.push(`1:${classes}`)
				} else if (index != 0) {
					newClickValues.push(`0:opacity-0,${index}:opacity-100`)
				}

				if (clickInPage < (index || 1)) {
					clickInPage = index || 1
				}
			}

			node.data ??= {}
			node.data.hProperties = {
				...node.data.hProperties,
				click: join(newClickValues, ',')
			}
		})

		const store = getStore(file)
		store.click = clickInPage
		file.data.store = store
	}
}

export const shikiHighlighter = () => {
	return async (tree: HRoot) => {
		const preElements: Element[] = []

		visit(tree, { tagName: 'pre' }, (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			preElements.push(node)
		})

		for (const pre of preElements) {
			await transformShiki(pre)

			visit(pre, { type: 'text' }, (node) => {
				if ('value' in node) {
					node.value = escapeCode(node.value)
				}
			})
		}
	}
}

export const escapeSvelteSyntax = () => {
	return (tree: HRoot) => {
		visit(tree, { tagName: 'p' }, (node) => {
			if (node.children[0] && 'value' in node.children[0] && Parser.isSvelte(node.children[0].value)) {
				node.tagName = 'unknown'
			}
		})
	}
}
