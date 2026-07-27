import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Attribute, SlideContext, SlideData } from '../types.js'

export interface AttributeContext {
	key: string
	value: Attribute[string]
	attribute: Attribute
	slideCtx: SlideContext
	slide: SlideData
}

export type AttributeProcessFn = (ctx: AttributeContext) => void | 'skip'

export interface AttributeProcess {
	types?: string[]
	key: string | RegExp
	process: AttributeProcessFn
}

export interface AttributeOptions {
	attributeProcess?: AttributeProcess[]
}

const matchesKey = (p: AttributeProcess, key: string): boolean =>
	typeof p.key === 'string' ? p.key === key : p.key.test(key)

const matchesType = (p: AttributeProcess, nodeType: string): boolean =>
	p.types === undefined || p.types.includes(nodeType)

export function attributeTransformer(opt?: AttributeOptions): Transformer {
	const processors = opt?.attributeProcess ?? []

	return (tree, vfile) => {
		const ctx = vfile.data.context as SlideContext

		visit(tree as Root, (node) => {
			const hProperties = node.data?.hProperties as Attribute | undefined
			if (!hProperties) return

			const applicable = processors.filter((p) => matchesType(p, node.type))
			if (applicable.length === 0) return

			const slide = ctx.slides[node.indexGroup ?? 0]
			const skip = new Set<AttributeProcessFn>()

			for (const [key, value] of Object.entries(hProperties)) {
				for (const p of applicable) {
					if (skip.has(p.process) || !matchesKey(p, key)) continue
					if (p.process({ key, value, attribute: hProperties, slideCtx: ctx, slide }) === 'skip') {
						skip.add(p.process)
					}
				}
			}
		})
	}
}
