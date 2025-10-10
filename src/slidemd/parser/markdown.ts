/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElementContent } from 'hast'
import type { Node, Parent, Root, RootContent } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { highlightHast } from './shiki'

export const parseAttributes = (value: string) => {
	const attrs: Record<string, any> = {}
	for (const match of value.matchAll(/(?<=^|\s)([\w:-]+)(?:="(.*)"|='(.*)'|=([^\s]+))?(?=\s|$)/g)) {
		const key = match[1]
		attrs[key] = match[2] || match[3] || match[4] || ''
	}
	return attrs
}

export const parseClass = (value: string) => {
	const className: string[] = []
	for (const match of value.matchAll(/(?<=^|\s)\.([^\s]+)(?=\s|$)/g)) {
		className.push(match[1])
	}
	return className
}

export const createSplitParent = (childrent: RootContent[]) => {
	return {
		type: 'parent',
		children: childrent,
		data: {
			hName: 'section',
			hProperties: {
				class: 'split-contents'
			}
		}
	} as Parent
}

export const escapeCode = (str: string) => {
	return str.replace(/[&<>{}]/g, (char) => `{'${char}'}`)
}

const defaultFilters: Record<string, string> = {
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

export const enhanceImage = (p: Parent) => {
	const advancedBg = {
		type: 'parent',
		data: {
			hProperties: {
				class: 'advanced-bg',
				style: '',
				vertical: false
			}
		},
		children: [] as RootContent[]
	}

	let skip = -1
	visit(p, 'image', (node, index, parent) => {
		if (typeof index !== 'number' || !parent || skip == index) return

		const list = node.alt?.split(/\s+/) || []
		node.alt = list.shift()

		const alt = list.join(' ')

		const elementAttrs: Record<string, any> = {}
		const filters: string[] = []
		const imgAttrs: Record<string, string> = {}

		for (const match of alt.matchAll(/(?<=^|\s)([\w:-]+)(?:="(.*)"|='(.*)'|=([^\s]+))?(?=\s|$)/g)) {
			const key = match[1]
			const value = match[2] || match[3] || match[4] || ''

			if (Object.keys(defaultFilters).includes(key)) {
				filters.push(`${key}(${value || defaultFilters[key]})`)
				continue
			}

			if (['cover', 'contain', 'fill'].includes(key) && !value) {
				imgAttrs['fit'] = key
				continue
			}

			if (['w', 'h', 'x', 'y'].includes(key) && value) {
				imgAttrs[key] = value
				continue
			}

			if (['top', 'left', 'right', 'bottom', 'center'].includes(key)) {
				if (value) {
					imgAttrs[key] = value
				} else {
					imgAttrs['pos'] = key
				}
				continue
			}

			if (['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round'].includes(key)) {
				if (!value) {
					imgAttrs['repeat'] = key
				} else if (['repeat-x', 'repeat-y'].includes(key)) {
					imgAttrs[key] = value
				}
				continue
			}

			if (['bg', 'absolute'].includes(key) && !value) {
				elementAttrs[key] = true
				continue
			}

			if (key == 'vertical' && !value) {
				advancedBg.data.hProperties.vertical = true
				continue
			}

			elementAttrs[key] = value
		}

		elementAttrs['class'] = [elementAttrs['class'], ...parseClass(alt)].filter(Boolean).join(' ') || undefined

		if (!elementAttrs['bg']) {
			const style = [
				filters.length > 0 ? `filter: ${filters.join(' ')}` : null,

				imgAttrs['pos']
					? `object-position: ${imgAttrs['pos']}`
					: imgAttrs['x'] || imgAttrs['y']
						? `object-position: ${imgAttrs['x'] || '50%'} ${imgAttrs['y'] || '50%'}`
						: null,

				imgAttrs['fit'] ? `object-fit: ${imgAttrs['fit']}` : null,
				imgAttrs['w'] ? `width: ${imgAttrs['w']}` : null,
				imgAttrs['h'] ? `height: ${imgAttrs['h']}` : null,

				imgAttrs['top'] ? `top: ${imgAttrs['top']}` : null,
				imgAttrs['left'] ? `left: ${imgAttrs['left']}` : null,
				imgAttrs['right'] ? `right: ${imgAttrs['right']}` : null,
				imgAttrs['bottom'] ? `bottom: ${imgAttrs['bottom']}` : null,

				elementAttrs['absolute'] ? 'position: absolute' : null
			]

			node.data = { ...node.data }
			node.data.hProperties = {
				...node.data.hProperties,
				...elementAttrs,
				loading: 'lazy',
				style: style.filter(Boolean).join(';') || undefined
			}

			if (elementAttrs['absolute'] || elementAttrs['class']?.includes('absolute')) {
				visit(p, parent, (n, index, grandParent) => {
					if (typeof index !== 'number' || !grandParent) return
					parent.children.splice(index, 1)
					grandParent?.children.splice(index + 1, 0, node)
					skip = index + 1
				})
			}
		} else {
			const style = [
				`background-image: url(${node.url})`,

				filters.length > 0 ? `background-filter: ${filters.join(' ')}` : null,

				imgAttrs['pos']
					? `background-position: ${imgAttrs['pos']}`
					: imgAttrs['x'] || imgAttrs['y']
						? `background-position: ${imgAttrs['x'] || '50%'} ${imgAttrs['y'] || '50%'}`
						: null,

				imgAttrs['fit']
					? `background-size: ${imgAttrs['fit']}`
					: imgAttrs['w'] || imgAttrs['h']
						? `background-size: ${imgAttrs['w'] || 'auto'} ${imgAttrs['h'] || 'auto'}`
						: null,

				imgAttrs['repeat']
					? `background-repeat: ${imgAttrs['repeat']}`
					: imgAttrs['repeat-x'] || imgAttrs['repeat-y']
						? `background-repeat: ${imgAttrs['repeat-x'] || 'no-repeat'} ${imgAttrs['repeat-y'] || 'no-repeat'}`
						: null
			]

			elementAttrs['class'] = ['advanced-bg-image', elementAttrs['class']].filter(Boolean).join(' ')

			const bg = {
				type: 'bg',
				data: {
					hProperties: {
						...elementAttrs,
						style: style.filter(Boolean).join(';')
					}
				}
			}
			advancedBg.children.push(bg as RootContent)
			parent.children.splice(index, 1)
		}

		if (parent.children.length == 0 && parent != p) {
			parent.data = { ...parent.data }
			parent.data.hProperties = {
				...parent.data.hProperties,
				class: 'hidden'
			}
		}
	})

	if (advancedBg.children.length > 0) {
		const gridDir = advancedBg.data.hProperties.vertical ? '--bg-rows' : '--bg-columns'
		const gridSize = advancedBg.children.map((n) => {
			return n.data?.hProperties?.size || '1fr'
		})
		advancedBg.data.hProperties.style = `${gridDir}: ${gridSize.join(' ')}`

		p.children.push(advancedBg as RootContent)
	}
}

export const enhanceCode = async (p: Parent) => {
	interface Code {
		code: string
		lang: string
		parent: Parent
	}

	const codeList: Code[] = []
	visit(p, 'code', (node, index, parent) => {
		if (typeof index !== 'number' || !parent) return

		const meta = node.meta || ''
		const lang = node.lang || 'plaintext'

		const attrs = parseAttributes(meta)
		attrs['class'] = [attrs['class'], ...parseClass(node.meta || '')].filter(Boolean).join(' ') || undefined

		if (lang === 'mermaid') {
			attrs.class = ['mermaid', attrs['class']].filter(Boolean).join(' ')

			const mermaid = {
				type: 'text',
				value: escapeCode(node.value)
			}
			const container = {
				type: 'parent',
				data: {
					hName: 'pre',
					hProperties: {
						...attrs
					}
				},
				children: [mermaid]
			}
			parent.children.splice(index, 1, container as RootContent)
			return
		}
		attrs.class = [`language-${lang}`, attrs['class']].filter(Boolean).join(' ')

		const container: Parent = {
			type: 'parent',
			data: {
				hProperties: {
					...attrs
				},
				hChildren: [
					{
						type: 'raw',
						value: `<button class="copy"></button>`
					},
					{
						type: 'raw',
						value: `<span class="lang">${lang}</span>`
					}
				]
			},
			children: []
		}

		parent.children.splice(index, 1, container as RootContent)
		codeList.push({
			code: node.value,
			lang: lang,
			parent: container
		})
	})

	await Promise.all(
		codeList.map(async (c) => {
			const code = await highlightHast(c.code, c.lang)
			if (!code) return

			visit(code, 'text', (node) => {
				node.value = escapeCode(node.value)
			})

			c.parent.data?.hChildren?.push(code as ElementContent)
		})
	)
}

export const getMaxClickable = (p: Parent) => {
	let maxClick = 0
	visit(p, (node) => {
		const attrs = node.data?.hProperties || {}
		const keys = Object.keys(attrs)
			.filter((key) => key.startsWith('click-'))
			.map((key) => {
				for (const match of key.matchAll(/^click-(\d)$/g)) {
					const click = parseInt(match[1])
					if (maxClick < click) {
						maxClick = click
					}
				}
				return key
			})

		if (keys.length === 1 && attrs[keys[0]] == '') {
			attrs[keys[0]] = 'opacity-100'
			attrs['click-0'] = 'opacity-0'
			attrs['class'] = [attrs['class'], attrs['click-0']].filter(Boolean).join(' ')

			node.data = { ...node.data }
			node.data.hProperties = attrs
		}
	})
	return maxClick
}

export const remarkSlideMD: Plugin = () => {
	interface Split {
		index: number
		size: string
	}

	return async (tree: Node) => {
		const root = tree as Root

		let directive: Record<string, any> = {}
		let parents: Parent[] = []

		const splits: Split[] = []
		visit(root, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			for (const match of node.value.matchAll(/^<!--\s*split(?:[:=]"(.*)"|[:=]'(.*)'|[:=]([^\s]+))?\s*-->$/g)) {
				if (parent != root) return

				splits.push({
					index,
					size: match[1] || match[2] || match[3] || '1fr'
				})
				return
			}

			for (const match of node.value.matchAll(/^<!--(.*)-->$/g)) {
				const attrs = parseAttributes(match[1])
				attrs['class'] = [attrs['class'], ...parseClass(match[1])].filter(Boolean).join(' ')

				if (parent === root) {
					directive = { ...directive, ...attrs }
				} else {
					parent.data = { ...parent.data }
					parent.data.hProperties = {
						...parent.data.hProperties,
						...attrs
					}
				}
				return
			}
		})

		if (splits.length > 0) {
			let latestIdx = 0
			parents = splits.map((s) => {
				const tmpIndex = latestIdx
				latestIdx = s.index
				return createSplitParent(root.children.slice(tmpIndex, s.index))
			})
			parents.push(createSplitParent(root.children.slice(latestIdx)))
		} else {
			parents = [root]
		}

		// const { parents, directive } = getParentDirective(root)
		if (parents[0] !== root) {
			root.children = [...parents] as RootContent[]
		}

		parents.forEach(enhanceImage)
		await enhanceCode(root)

		directive.click = getMaxClickable(root)
	}
}
