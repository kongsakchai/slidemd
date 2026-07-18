import { Root, RootContent } from 'mdast'
import type { Transformer } from 'unified'
import { visitParents } from 'unist-util-visit-parents'

import { Attribute, Directive, SlideContext } from '../types.js'

export type AttributeProcessFn = (
	key: string,
	value: Attribute[string],
	attribute: Attribute,
	fileData?: Directive
) => void | 'skip'

export interface AttributeProcess {
	types?: string[]
	key: string | RegExp
	process: AttributeProcessFn
}

export interface AttributeOptions {
	attributeProcess?: AttributeProcess[]
}

type ProcessorRegistryByNodeType = Record<string, AttributeProcess[]>

const ANY_NODE_TYPE = ''

function buildProcessorRegistry(attributeProcess: AttributeProcess[] = []): ProcessorRegistryByNodeType {
	const registryByNodeType: ProcessorRegistryByNodeType = {}
	for (const attr of attributeProcess) {
		for (const nodeType of attr.types ?? [ANY_NODE_TYPE]) {
			const registry = (registryByNodeType[nodeType] ??= [])
			registry.push(attr)
		}
	}
	return registryByNodeType
}

function findAttributeProcessFn(list: AttributeProcess[], key: string): AttributeProcessFn[] {
	return list
		.filter((p) => {
			if (typeof p.key === 'string') {
				return p.key === key
			} else {
				return p.key.test(key)
			}
		})
		.map((p) => p.process)
}

export function attributeTransformer(opt?: AttributeOptions): Transformer {
	const registryByNodeType = buildProcessorRegistry(opt?.attributeProcess)

	return (tree, vfile) => {
		const ctx = vfile.data.context as SlideContext

		const root = tree as Root
		visitParents(root, (node, ancestors) => {
			if (!('data' in node && node.data)) return
			if (!('hProperties' in node.data && node.data.hProperties)) return

			const index =
				ancestors.length > 1
					? root.children.indexOf(ancestors[1] as RootContent)
					: root.children.indexOf(node as RootContent)

			const slide = ctx.slides.findLast((p) => index >= p.breakIndex)
			if (slide) slide.extra ??= {}

			const registry = [...(registryByNodeType[node.type] ?? []), ...(registryByNodeType[ANY_NODE_TYPE] ?? [])]
			if (registry.length === 0) return

			const hProperties = node.data.hProperties
			const skip = new Set<AttributeProcessFn>()
			for (const [attributeName, attributeValue] of Object.entries(hProperties)) {
				const process = findAttributeProcessFn(registry, attributeName)
				process.forEach((p) => {
					if (skip.has(p)) return
					const val = p(attributeName, attributeValue, hProperties, slide?.extra)
					if (val === 'skip') skip.add(p)
				})
			}
		})
	}
}
