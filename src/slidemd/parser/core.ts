/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElementContent } from 'hast'
import type { Node, Parent, Root, RootContent } from 'mdast'
import type { Plugin } from 'unified'
import { remove } from 'unist-util-remove'
import { EXIT, visit } from 'unist-util-visit'
import { VFile } from 'vfile'
import { Context } from './context'
import { highlightHast } from './shiki'
import { type Attribuites, type CodeToHighlight, type ImageAttributes, type SplitData } from './types'

const SVELTE_ATTRIBUTES = new Set(['bind', 'use', 'transition', 'in', 'out', 'animate', 'style', 'class'])

const DEFAULT_FILTERS: Record<string, string> = {
	blur: '10px',
	brightness: '1.5',
	contrast: '2',
	grayscale: '1',
	'hue-rotate': '180deg',
	invert: '1',
	opacity: '0.5',
	saturate: '2',
	sepia: '1',
	'drop-shadow': '2px 2px 5px rgba(0, 0, 0, 0.5)'
}

const IMAGE_FIT_KEYS = new Set(['cover', 'contain', 'fill'])
const IMAGE_POSITION_KEYS = new Set(['top', 'left', 'right', 'bottom', 'center'])
const IMAGE_DIMENSION_KEYS = new Set(['w', 'h', 'x', 'y'])
const IMAGE_KEYS = new Set(['bg', 'absolute', 'vertical'])
const REPEAT_KEYS = new Set(['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round'])
const REPEAT_XY_KEYS = new Set(['rx', 'ry'])

const ATTR_REGEX = /(?<=^|\s)([\w-@]+(?::[^\s=]+)?)(?:="(.*?)"|='(.*?)'|=([^\s]+?))?(?=\s|$)/g
const CLASS_REGEX = /(?<=^|\s)\.([^\s]+)(?=\s|$)/g
const SPLIT_REGEX = /^<!--\s*split(?:[:=]([^\s]+))?(?:\s+(vertical))?\s*-->$/g
const COMMENT_REGEX = /^<!--(.*)-->$/g
const CLICK_REGEX = /^click-(\d)/g

// Extract

export const extractAttributes = (value: string) => {
	const attrs: Attribuites = {}
	for (const match of value.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[2] || match[3] || match[4] || ''

		if (!value && key.includes(':')) {
			const [prefix, suffix] = key.split(':', 2)
			if (!SVELTE_ATTRIBUTES.has(prefix)) {
				attrs[prefix] = suffix
				continue
			}
		}

		if (key.startsWith('click-')) {
			attrs['click'] = true
		}

		attrs[key] = value
	}
	return attrs
}

export const extractClassNames = (value: string) => {
	return Array.from(value.matchAll(CLASS_REGEX), (m) => m[1])
}

export const extractImageAttributes = (value: string) => {
	const imgAttrs: ImageAttributes = {}
	const attrs: Attribuites = {}

	for (const match of value.matchAll(ATTR_REGEX)) {
		let key = match[1] as keyof ImageAttributes
		let value = match[2] || match[3] || match[4] || ''

		if (!value && key.includes(':')) {
			const [prefix, suffix] = key.split(':', 2)
			if (SVELTE_ATTRIBUTES.has(prefix)) {
				attrs[key] = ''
				continue
			}
			key = prefix as keyof ImageAttributes
			value = suffix
		}

		if (key in DEFAULT_FILTERS) {
			if (!imgAttrs.filters) imgAttrs.filters = []
			imgAttrs.filters.push(`${key}(${value || DEFAULT_FILTERS[key]})`)
			continue
		}

		if (IMAGE_POSITION_KEYS.has(key)) {
			if (value) {
				imgAttrs[key] = value as never
			} else {
				imgAttrs.pos = key
			}
			continue
		}

		if (!value) {
			if (IMAGE_FIT_KEYS.has(key)) {
				imgAttrs.fit = key
				continue
			}

			if (REPEAT_KEYS.has(key)) {
				imgAttrs['repeat'] = key
				continue
			}

			if (IMAGE_KEYS.has(key)) {
				imgAttrs[key] = true as never
				continue
			}

			if (/\d+\w+/g.test(key)) {
				imgAttrs.fit = key
				continue
			}
		} else {
			if (IMAGE_DIMENSION_KEYS.has(key) && value) {
				imgAttrs[key] = value as never
				continue
			}

			if (REPEAT_XY_KEYS.has(key) && value) {
				imgAttrs[key] = value as never
				continue
			}
		}

		attrs[key as keyof ImageAttributes] = value
	}

	return { imgAttrs, attrs }
}

// Utils

export const calculateClickable = (page: number, attrs: Attribuites) => {
	let maxClick = 0
	const keys = Object.keys(attrs).filter((key) => {
		for (const match of key.matchAll(CLICK_REGEX)) {
			const click = parseInt(match[1])
			maxClick = Math.max(click, maxClick)
			return key
		}
		return false
	})

	if (keys.length === 1 && attrs[keys[0]] == '') {
		attrs[keys[0]] = 'opacity-100'
		attrs['click-0'] = 'opacity-0'
	}
	if (keys.length > 0) {
		attrs.click = true
		attrs['use:regisClickable'] = `{${page}}`
	}

	attrs.class = combineClassNames(attrs.class as string, attrs['click-0'] as string)

	return maxClick
}

const escapeSpecialCharacters = (str: string) => {
	return str.replace(/[&<>{}]/g, (char) => `{'${char}'}`)
}

// Build

export const buildImageStyle = (attrs: ImageAttributes) => {
	const styles: string[] = []

	if (attrs.filters && attrs.filters.length > 0) styles.push(`filter: ${attrs.filters.join(' ')}`)

	if (attrs.x || attrs.y) {
		styles.push(`object-position: ${attrs.x || '50%'} ${attrs.y || '50%'}`)
	} else if (attrs.pos) {
		styles.push(`object-position: ${attrs.pos}`)
	}

	if (attrs.fit) styles.push(`object-fit: ${attrs.fit}`)
	if (attrs.w) styles.push(`width: ${attrs.w}`)
	if (attrs.h) styles.push(`height: ${attrs.h}`)
	if (attrs.top) styles.push(`top: ${attrs.top}`)
	if (attrs.left) styles.push(`left: ${attrs.left}`)
	if (attrs.right) styles.push(`right: ${attrs.right}`)
	if (attrs.bottom) styles.push(`bottom: ${attrs.bottom}`)
	if (attrs.absolute) styles.push('position: absolute')

	return styles.length > 0 ? styles.join(';') : undefined
}

export const buildBackgroundStyle = (url: string, attrs: ImageAttributes) => {
	const styles = [`background-image: url(${url})`]

	if (attrs.filters && attrs.filters.length > 0) styles.push(`background-filter: ${attrs.filters.join(' ')}`)

	if (attrs.x || attrs.y) {
		styles.push(`background-position: ${attrs.x || '50%'} ${attrs.y || '50%'}`)
	} else if (attrs.pos) {
		styles.push(`background-position: ${attrs.pos}`)
	}

	if (attrs.w || attrs.h) {
		styles.push(`background-size: ${attrs.w || 'auto'} ${attrs.h || 'auto'}`)
	} else if (attrs.fit) {
		styles.push(`background-size: ${attrs.fit}`)
	}

	if (attrs['rx'] || attrs['ry']) {
		styles.push(`background-repeat: ${attrs['rx'] || 'no-repeat'} ${attrs['ry'] || 'no-repeat'}`)
	} else if (attrs.repeat) {
		styles.push(`background-repeat: ${attrs.repeat}`)
	}

	return styles.join(';')
}

export const buildSlideStyle = (attrs: Attribuites) => {
	const styles: string[] = []
	if (attrs._style) {
		styles.push(attrs._style)
	}
	if (attrs._bgImg) {
		const imgs = (attrs._bgImg as string)
			.split(',')
			.map((img) => `url(${img})`)
			.join(', ')

		styles.push(`background-image: ${imgs}`)
	}
	if (attrs._bgColor) {
		styles.push(`background-color: ${attrs._bgColor}`)
	}
	if (attrs._bgSize) {
		styles.push(`background-size: ${attrs._bgSize}`)
	}
	if (attrs._bgPosition) {
		styles.push(`background-position: ${attrs._bgPosition}`)
	}
	if (attrs._bgRepeat) {
		styles.push(`background-repeat: ${attrs._bgRepeat}`)
	}

	if (attrs.split) {
		if (attrs.splitDir === 'vertical') {
			styles.push(`--split-row: ${attrs.splitSize}`)
		} else {
			styles.push(`--split-col: ${attrs.splitSize}`)
		}
	}

	return combineString(';', ...styles)
		?.replace(/;{2,}/g, ';')
		.trim()
}

// Combine

const DIRECTIVE_KEYS = [
	'paging',
	'class',
	'style',
	'color',
	'bgImg',
	'bgColor',
	'bgSize',
	'bgPos',
	'bgRepeat',
	'transition',
	'in',
	'out',
	'duration',
	'timing'
]

export const combineString = (separator = ' ', ...str: (string | undefined)[]) => {
	const combine = str.filter(Boolean)
	return combine.length > 0 ? combine.join(separator) : undefined
}

export const combineClassNames = (...classes: (string | undefined)[]) => {
	return combineString(' ', ...classes)
}

export const combineDirective = (vfile: VFile, attrs: Attribuites) => {
	for (const key of DIRECTIVE_KEYS) {
		const localKey = `_${key}`

		attrs[localKey] ??= attrs[key] ?? vfile.data[key]
		vfile.data[key] = attrs[key] ?? vfile.data[key]

		if (attrs[localKey] === undefined || attrs[localKey] === '-') {
			delete attrs[localKey]
		}
		if (attrs[key] === undefined || attrs[key] === '-') {
			delete attrs[key]
		}
		if (vfile.data[key] === undefined || vfile.data[key] === '-') {
			delete vfile.data[key]
		}
	}
}

// Create

const createMermaidContainer = (code: string, attrs: Attribuites, classes: string[]) => {
	attrs.class = combineClassNames('mermaid', attrs.class, ...classes)
	const container = {
		type: 'mermaid-container',
		data: {
			hName: 'pre',
			hProperties: {
				...attrs
			}
		},
		children: [
			{
				type: 'text',
				value: escapeSpecialCharacters(code)
			}
		]
	}
	return container
}

const createCodeContainer = (lang: string, attrs: Attribuites, classes: string[]) => {
	attrs.class = combineClassNames(`language-${lang}`, attrs.class, ...classes)
	const container: Parent = {
		type: 'code-container',
		data: {
			hProperties: {
				...attrs
			},
			hChildren: [
				{ type: 'raw', value: `<button class="copy"></button>` },
				{ type: 'raw', value: `<span class="lang">${lang}</span>` }
			]
		},
		children: []
	}
	return container
}

const createAdvanceBackground = (children: RootContent[], vertical: boolean) => {
	const size = children.map(() => '1fr').join(' ')
	return {
		type: 'advance-background',
		data: {
			hProperties: {
				class: 'advanced-bg',
				style: `${vertical ? '--bg-rows' : '--bg-columns'}:${size}`
			}
		},
		children: children
	} as Parent
}

const createSplitContainer = (ctx: Context, data: SplitData) => {
	return {
		type: 'split-container',
		children: ctx.subChildren(data.start, data.end),
		data: {
			hName: 'section',
			hProperties: {
				class: combineClassNames('split-contents', data.directive.class),
				style: buildSlideStyle(data.directive)
			}
		}
	} as Parent
}

const createSlideContainer = (ctx: Context) => {
	return {
		type: 'slide-container',
		children: ctx.children,
		data: {
			hName: 'section',
			hProperties: {
				'data-page': ctx.page,
				class: combineClassNames('slide', ctx.directive.class, ctx.split ? 'split' : ''),
				hidden: `{currentPage !== ${ctx.page}}`,
				style: buildSlideStyle(ctx.directive)
			}
		}
	} as Parent
}

// Process

export const processSvelteSyntax = (ctx: Context) => {
	visit(ctx.root, 'paragraph', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		const extract = node.children
			.filter((c) => c.type === 'text')
			.some((n) => {
				return /^{[#:/@].*}/.test(n.value)
			})

		if (extract) {
			parent.children.splice(index, 1, ...node.children)
			return 'skip'
		}
	})
}

export const processHTMLNode = (ctx: Context) => {
	const splitSize: string[] = []
	const split: SplitData = { start: 0, directive: {} }

	visit(ctx.root, 'html', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		for (const match of node.value.matchAll(SPLIT_REGEX)) {
			if (parent != ctx.root) return
			ctx.split = true
			splitSize.push(match[1] || '1fr')

			split.end = index
			const splitContainer = createSplitContainer(ctx, split)
			const delCount = split.end - split.start + 1
			parent.children.splice(split.start, delCount, splitContainer as RootContent)

			split.directive = {}
			split.start++
			return split.start
		}

		for (const match of node.value.matchAll(COMMENT_REGEX)) {
			const attrs = extractAttributes(match[1])
			const classes = extractClassNames(match[1])
			attrs['class'] = combineClassNames(attrs.class, ...classes)

			if (parent === ctx.root) {
				if (attrs['@split'] !== undefined) {
					attrs.class = combineClassNames(split.directive.class, attrs.class)
					split.directive = { ...split.directive, ...attrs }
				} else {
					attrs.class = combineClassNames(ctx.directive.class, attrs.class)
					ctx.directive = { ...ctx.directive, ...attrs }
				}
			} else {
				if (attrs.click) {
					ctx.vfile.data.click = Math.max(
						calculateClickable(ctx.page, attrs),
						(ctx.vfile.data.click as number) || 0
					)
				}

				parent.data = { ...parent.data }
				parent.data.hProperties = {
					...parent.data.hProperties,
					...attrs
				}
			}

			parent.children.splice(index, 1)
			return index
		}
	})

	if (ctx.split) {
		splitSize.push('1fr')

		split.end = ctx.children.length
		const splitContainer = createSplitContainer(ctx, split)
		const delCount = split.end - split.start + 1
		ctx.children.splice(split.start, delCount, splitContainer as RootContent)
	}

	ctx.directive.split = ctx.split
	ctx.directive.splitSize = combineString(' ', ...splitSize)
}

export const processImageNode = (ctx: Context) => {
	ctx.parents.forEach((p) => {
		const backgrounds: RootContent[] = []
		let vertical = false

		visit(p, 'image', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const alt = node.alt?.split(' ') || ['']
			const altAttrs = alt?.slice(1).join(' ') || ''
			const { imgAttrs, attrs } = extractImageAttributes(altAttrs)

			const classes = extractClassNames(altAttrs)
			attrs['class'] = combineClassNames(attrs.class, ...classes)

			if (!imgAttrs.bg) {
				const style = buildImageStyle(imgAttrs)

				node.data = { ...node.data }
				node.data.hProperties = {
					...node.data.hProperties,
					...attrs,
					loading: 'lazy',
					style: style,
					absolute: imgAttrs.absolute || attrs['class']?.includes('absolute')
				}
				node.alt = alt[0]
			} else {
				const style = buildBackgroundStyle(node.url, imgAttrs)
				attrs['class'] = combineClassNames('advanced-bg-image', attrs.class)

				const bg = {
					type: 'bg-img',
					data: {
						hProperties: {
							...attrs,
							style: style
						}
					}
				}

				backgrounds.push(bg as RootContent)
				vertical ||= imgAttrs.vertical as boolean

				parent.children.splice(index, 1)
				return index
			}

			if (parent.children.length === 1) {
				visit(ctx.root, parent, (_, index, parentOfParent) => {
					if (typeof index !== 'number' || !parentOfParent) return
					parentOfParent.children.splice(index, 1, node)
					return EXIT
				})
			}
		})

		if (backgrounds.length > 0) {
			const advancedBackground = createAdvanceBackground(backgrounds, vertical)
			p.children.push(advancedBackground as RootContent)
		}
	})

	remove(ctx.root, (node) => {
		if (node.type !== 'paragraph') return false

		const children = (node as Parent).children
		return children.length === 0 || children.every((n) => n.type === 'text' && n.value.trim() === '')
	})
}

export const processCodeNode = async (ctx: Context) => {
	const highlightList: CodeToHighlight[] = []
	visit(ctx.root, 'code', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		const meta = node.meta || ''
		const lang = node.lang || 'plaintext'

		const attrs = extractAttributes(meta)
		const classes = extractClassNames(meta)

		if (lang === 'mermaid') {
			const mermaid = createMermaidContainer(node.value, attrs, classes)
			parent.children.splice(index, 1, mermaid as RootContent)
			return
		}

		const container = createCodeContainer(lang, attrs, classes)
		parent.children.splice(index, 1, container as RootContent)
		highlightList.push({
			code: node.value,
			lang: lang,
			parent: container
		})
	})

	await Promise.all(
		highlightList.map(async (c) => {
			const code = await highlightHast(c.code, c.lang)

			visit(code, 'text', (node) => {
				node.value = escapeSpecialCharacters(node.value)
			})

			c.parent.data?.hChildren?.push(code as ElementContent)
		})
	)
}

export const remarkSlideMD: Plugin = () => {
	return async (tree: Node, vfile) => {
		const root = tree as Root
		const ctx = new Context(root, vfile)

		processHTMLNode(ctx)
		processImageNode(ctx)
		processSvelteSyntax(ctx)

		await processCodeNode(ctx)

		const slide = createSlideContainer(ctx)
		root.children = [slide] as RootContent[]
	}
}
