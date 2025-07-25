import type { Parent, RootContent, RootContentMap } from 'mdast'
import { parseSplit } from './parser'

export const splitSize = (children: RootContent[]) => {
	if (children.length === 0) {
		return '1fr'
	}
	const latest = children[children.length - 1]
	if (latest.type !== 'html') {
		return '1fr'
	}

	const split = parseSplit(latest.value)
	if (!split) {
		return '1fr'
	}

	return split
}

export const processSplit = (node: RootContentMap['html']) => {
	const split = parseSplit(node.value)
	if (!split) {
		return '1fr'
	}

	return split
}

export const makeSplitParent = (node: RootContent[]) => {
	return {
		type: 'split',
		children: node,
		data: {
			hProperties: {
				class: 'slide-child'
			}
		}
	} as Parent
}
