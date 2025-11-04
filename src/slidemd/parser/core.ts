/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElementContent } from 'hast'
import type { Node, Parent, Root, RootContent } from 'mdast'
import type { Plugin } from 'unified'
import { remove } from 'unist-util-remove'
import { EXIT, visit } from 'unist-util-visit'

import { Context, RootContext } from './context'
import { highlightHast } from './shiki'
import type { Attribuites, CodeToHighlight, ImageAttributes } from './types'

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

const DIRECTIVE_REGEX = /^([\S]+)(?::\s([\s\S]*?))?$/g
const ATTR_REGEX = /(?<=^|\s)([\w-@:]+)(?:="([\s\S]*?)"|='([\s\S]*?)'|=([^\s]+?))?(?=\s|$)/g
const CLASS_REGEX = /(?<=^|\s)\.([^\s]+)(?=\s|$)/g
const SPLIT_REGEX = /^<!--\s*split(?::\s?([^\s]+))?(?:\s+(vertical))?\s*-->$/g
const COMMENT_REGEX = /^<!--([\s\S]*)-->$/g
const STEP_REGEX = /^step-(\d)/g

// Extract

export const extractDirectives = (value: string) => {
	const directive: Attribuites = {}
	for (const str of value.trim().split('\n')) {
		for (const match of str.matchAll(DIRECTIVE_REGEX)) {
			const key = match[1]
			const value = match[2] || ''
			directive[key] = value
		}
	}
	return directive
}

export const extractAttributes = (value: string) => {
	const attrs: Attribuites = {}
	for (const match of value.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[2] || match[3] || match[4] || ''

		if (key.startsWith('step-')) {
			attrs['step'] = true
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
		const key = match[1] as keyof ImageAttributes
		const value = match[2] || match[3] || match[4] || ''

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

export const calculateSteps = (page: number, attrs: Attribuites) => {
	let stepCount = 0
	const keys = Object.keys(attrs).filter((key) => {
		for (const match of key.matchAll(STEP_REGEX)) {
			const step = parseInt(match[1])
			stepCount = Math.max(step, stepCount)
			return key
		}
		return false
	})

	if (keys.length === 1 && attrs[keys[0]] == '') {
		attrs[keys[0]] = 'opacity-100'
		attrs['step-0'] = 'opacity-0'
	}
	if (keys.length > 0) {
		attrs.step = true
		attrs['use:regisSteps'] = `{${page}}`
	}

	attrs.class = combineClassNames(attrs.class as string, attrs['step-0'] as string)

	return stepCount
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

	if (attrs.filters && attrs.filters.length > 0) styles.push(`filter: ${attrs.filters.join(' ')}`)

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

export const buildSlideStyle = (ctx: Context) => {
	const styles: string[] = []
	if (ctx.directive._style) {
		styles.push(ctx.directive._style)
	}
	if (ctx.directive._bgImg) {
		styles.push(`--bg-img: ${ctx.directive._bgImg}`)
	}
	if (ctx.directive._bgColor) {
		styles.push(`--bg-color: ${ctx.directive._bgColor}`)
	}
	if (ctx.directive._bgSize) {
		styles.push(`--bg-size: ${ctx.directive._bgSize}`)
	}
	if (ctx.directive._bgPosition) {
		styles.push(`--bg-pos: ${ctx.directive._bgPosition}`)
	}
	if (ctx.directive._bgRepeat) {
		styles.push(`--bg-repeat: ${ctx.directive._bgRepeat}`)
	}
	if (ctx.directive._bgOpacity) {
		styles.push(`--bg-opacity: ${ctx.directive._bgOpacity}`)
	}

	if (ctx.data.split) {
		if (ctx.data.splitDir === 'vertical') {
			styles.push(`--split-row: ${ctx.data.splitSize}`)
		} else {
			styles.push(`--split-col: ${ctx.data.splitSize}`)
		}
	}

	return combineString(';', ...styles)
		?.replace(/;{2,}/g, ';')
		.trim()
}

// Combine

export const combineString = (separator = ' ', ...str: (string | undefined)[]) => {
	const combine = str.filter(Boolean)
	return combine.length > 0 ? combine.join(separator) : undefined
}

export const combineClassNames = (...classes: (string | undefined)[]) => {
	return combineString(' ', ...classes)
}

export const combineDirective = (directive: Attribuites, external: Attribuites) => {
	const allKey = Object.keys({ ...directive, ...external }).map((k) => (k.startsWith('_') ? k.slice(1) : k))

	for (const key of new Set(allKey)) {
		const localKey = `_${key}`

		directive[localKey] ??= directive[key] ?? external[key]
		external[key] = directive[key] ?? external[key]

		if (directive[localKey] === '-') {
			delete directive[localKey]
		}

		if (directive[key] === '-') {
			delete directive[key]
			delete external[key]
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
				{ type: 'raw', value: `<button onclick={copyCode} class="copy"></button>` },
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

const createSplitContainer = (ctx: RootContext, split: Context) => {
	for (const key in split.directive) {
		if (!key.startsWith('_')) {
			split.directive[`_${key}`] = split.directive[key]
			delete split.directive[key]
		}
	}

	const isBg = !!split.directive._bgImg || !!split.directive._bgColor
	return {
		type: 'split-container',
		children: ctx.subChildren(split.data.start, split.data.end),
		data: {
			hName: 'section',
			hProperties: {
				class: combineClassNames('split-contents', split.directive._class, isBg ? 'bg' : ''),
				style: buildSlideStyle(split)
			}
		}
	} as Parent
}

const createSlideContainer = (ctx: RootContext) => {
	const isBg = !!ctx.directive._bgImg || !!ctx.directive._bgColor
	return {
		type: 'slide-container',
		children: ctx.children,
		data: {
			hName: 'section',
			hProperties: {
				'data-page': ctx.data.page,
				class: combineClassNames(
					'slide',
					ctx.directive._class,
					ctx.data.split ? 'split' : '',
					isBg ? 'bg' : ''
				),
				hidden: `{currentPage !== ${ctx.data.page}}`,
				style: buildSlideStyle(ctx)
			}
		}
	} as Parent
}

// Process

export const processSvelteSyntax = (ctx: RootContext) => {
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

export const processHTMLNode = (ctx: RootContext) => {
	const splitSize: string[] = []
	const splitCtx = new Context({ start: 0 })

	visit(ctx.root, 'html', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		for (const match of node.value.matchAll(SPLIT_REGEX)) {
			if (parent != ctx.root) return
			ctx.data.split = true
			splitSize.push(match[1] || '1fr')

			splitCtx.data.end = index
			const splitContainer = createSplitContainer(ctx, splitCtx)
			const delCount = splitCtx.data.end - splitCtx.data.start + 1
			parent.children.splice(splitCtx.data.start, delCount, splitContainer as RootContent)

			splitCtx.directive = {}
			return ++splitCtx.data.start
		}

		for (const match of node.value.matchAll(COMMENT_REGEX)) {
			if (parent === ctx.root) {
				const directive = extractDirectives(match[1])

				if (directive['@split'] !== undefined) {
					delete directive['@split']
					directive.class = combineClassNames(splitCtx.directive.class, directive.class)
					splitCtx.directive = { ...splitCtx.directive, ...directive }
				} else {
					directive.class = combineClassNames(ctx.directive.class, directive.class)
					ctx.directive = { ...ctx.directive, ...directive }
				}
			} else {
				const attrs = extractAttributes(match[1])
				const classes = extractClassNames(match[1])
				attrs['class'] = combineClassNames(attrs.class, ...classes)

				if (attrs.step) {
					ctx.vfile.data.step = Math.max(
						calculateSteps(ctx.data.page, attrs),
						(ctx.vfile.data.step as number) || 0
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

	if (ctx.data.split) {
		splitSize.push('1fr')

		splitCtx.data.end = ctx.children.length
		const splitContainer = createSplitContainer(ctx, splitCtx)
		const delCount = splitCtx.data.end - splitCtx.data.start + 1
		ctx.children.splice(splitCtx.data.start, delCount, splitContainer as RootContent)
	}

	ctx.data.splitSize = combineString(' ', ...splitSize)
	combineDirective(ctx.directive, ctx.vfile.data)
}

export const processImageNode = (ctx: RootContext) => {
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

export const processCodeNode = async (ctx: RootContext) => {
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
		const ctx = new RootContext(root, vfile)

		processHTMLNode(ctx)
		processImageNode(ctx)
		processSvelteSyntax(ctx)

		await processCodeNode(ctx)

		const slide = createSlideContainer(ctx)
		root.children = [slide] as RootContent[]
	}
}
