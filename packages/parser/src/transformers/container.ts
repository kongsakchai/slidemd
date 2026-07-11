import { Root } from 'mdast'
import { htmlBlockNames } from 'micromark-util-html-tag-name'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { Attribute } from '../types'

const BASIC_TAGS = new Set(htmlBlockNames)

export type AttributeProcess = (attr: Attribute) => Attribute

export interface ContainerOption {
	customContainer?: string[]
	attributeProcess?: Record<string, AttributeProcess>
}

export function containerTransformer(opt?: ContainerOption): Transformer {
	const customContainer = new Set(opt?.customContainer)
	const attributeProcess = opt?.attributeProcess || {}

	return (tree) => {
		visit(tree as Root, 'container', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const name = node.data.hName
			if (!BASIC_TAGS.has(name) && !customContainer.has(name)) {
				node.data.hName = 'div'
				node.data.hProperties.class = `${name} ${node.data.hProperties.class}`
			}

			for (const key in node.data.hProperties) {
				attributeProcess[key]?.(node.data.hProperties)
			}
		})
	}
}
