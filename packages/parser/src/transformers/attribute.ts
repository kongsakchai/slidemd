import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Attribute } from '../types'

export type AttributeProcessFn = (
	key: string,
	value: Attribute[string],
	attribute: Attribute,
	fileData?: Record<string, unknown>
) => void

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
		visit(tree as Root, (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			if (!('data' in node && node.data)) return
			if (!('hProperties' in node.data && node.data.hProperties)) return

			const registry = [...(registryByNodeType[node.type] ?? []), ...(registryByNodeType[ANY_NODE_TYPE] ?? [])]
			if (registry.length === 0) return

			const hProperties = node.data.hProperties
			for (const [attributeName, attributeValue] of Object.entries(hProperties)) {
				const process = findAttributeProcessFn(registry, attributeName)
				process.forEach((p) => p(attributeName, attributeValue, hProperties, vfile.data))
			}
		})
	}
}
