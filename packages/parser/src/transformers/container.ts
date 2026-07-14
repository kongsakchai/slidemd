import { Root } from 'mdast'
import { htmlBlockNames } from 'micromark-util-html-tag-name'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

const BASIC_TAGS = new Set(htmlBlockNames)

export interface ContainerOptions {
	customContainer?: string[]
}

export function containerTransformer(opt?: ContainerOptions): Transformer {
	const customContainer = new Set(opt?.customContainer)

	return (tree) => {
		visit(tree as Root, 'container', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const name = node.data.hName
			if (!BASIC_TAGS.has(name) && !customContainer.has(name)) {
				node.data.hName = 'div'
				node.data.hProperties.class = [name, node.data.hProperties.class].filter(Boolean).join(' ')
			}
		})
	}
}
