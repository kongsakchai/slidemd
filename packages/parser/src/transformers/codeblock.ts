import type { ElementContent, Root as HRoot, RootContent as HRootContent } from 'hast'
import type { Code, Parent, Root, RootContent } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Attribute, SlideContext, SlideData } from '../types.js'

export interface CodeContext {
	lang: string
	code: string
	meta: string
	attrs: Attribute
	slideCtx: SlideContext
	slide: SlideData
}

export type CodeHighlighter = (ctx: CodeContext) => Promise<HRootContent | ElementContent | HRoot>

export type CodeContainer = (ctx: CodeContext) => Promise<Parent>

export interface CodeblockOptions {
	highlight?: CodeHighlighter
	container?: CodeContainer
}

export function codeblockTransformer(options?: CodeblockOptions): Transformer {
	const container = options?.container ?? defaultContainer
	const highlight = options?.highlight ?? defaultHighlight

	return async (tree, vfile) => {
		const ctx = vfile.data.context as SlideContext

		const codeProcess: Promise<void>[] = []
		visit(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			codeProcess.push(transformCodeNode(node, index, parent, highlight, container, ctx))
		})

		await Promise.all(codeProcess)
	}
}

function escapeSpecialCharacters(str: string) {
	return str.replaceAll(/[{}]/g, (char) => `{'${char}'}`)
}

async function transformCodeNode(
	node: Code,
	index: number,
	parent: Parent,
	highlight: CodeHighlighter,
	container: CodeContainer,
	slideCtx: SlideContext
) {
	const ctx: CodeContext = {
		lang: node.lang || 'plaintext',
		code: node.value,
		meta: node.meta ?? '',
		attrs: extractAttributes(node.meta),
		slideCtx,
		slide: slideCtx.slides[node.indexGroup ?? 0]
	}
	ctx.attrs.class = `language-${ctx.lang} ${ctx.attrs.class ?? ''}`.trim()

	const containerEl = await container(ctx)
	parent.children.splice(index, 1, containerEl as RootContent)

	const html = await highlight(ctx)
	visit(html, 'text', (node) => {
		node.value = escapeSpecialCharacters(node.value)
	})

	containerEl.data?.hChildren?.push(html as ElementContent)
}

async function defaultContainer(ctx: CodeContext): Promise<Parent> {
	return {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: ctx.attrs,
			hChildren: [{ type: 'raw', value: `<span class="lang">${ctx.lang}</span>` }]
		},
		children: []
	}
}

async function defaultHighlight(ctx: CodeContext): Promise<ElementContent> {
	return {
		type: 'element',
		tagName: 'pre',
		properties: { lang: ctx.lang },
		children: [{ type: 'text', value: ctx.code }]
	}
}

// allow @ in class for tailwind v4 @sm:, @container
// allow : for svelte directive use: class: style:
// allow | for svelte transtion transition:fade|global
const ATTR_REGEX = /([.#a-zA-Z][.\w-:|@[\]/]+)(?:=(["'])(.*?)\2|=({.*?})|=([^\s]*))?/g
const EXCEPTED_KEY_REGEX = /[@[\]/]/

function extractAttributes(str?: string | null): Record<string, string> {
	if (!str) return {}

	const attrs: Record<string, string> = {}
	const ids: string[] = []
	const className: string[] = []

	for (const match of str.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[3] || match[4] || match[5] || ''

		if (key === 'class') {
			className.push(value)
		} else if (key === 'id') {
			ids.push(value)
		} else if (key.startsWith('.')) {
			className.push(key.slice(1) + value)
		} else if (key.startsWith('#')) {
			ids.push(key.slice(1) + value)
		} else if (!EXCEPTED_KEY_REGEX.test(key)) {
			attrs[key] = value
		}
	}
	if (className.length > 0) attrs['class'] = className.join(' ').trim()
	if (ids.length > 0) attrs['id'] = ids.join(' ').trim()

	return attrs
}
