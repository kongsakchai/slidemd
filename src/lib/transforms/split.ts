import { join } from '$lib/helper'
import type { Parent, RootContent } from 'mdast'
import { parseSplit } from './parser'

export const splitSize = (children: RootContent[]) => {
	console.log('splitSize', { children })

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

export const processSplit = (splitIndex: number[], root: Parent) => {
	const splitRoot: Parent[] = []
	const size: string[] = []

	splitIndex.reduce((prevIndex, currentIndex) => {
		const children = root.children.slice(prevIndex, currentIndex + 1)
		size.push(splitSize(children))

		const splitNode: Parent = {
			type: 'split',
			children: children,
			data: {
				hProperties: {
					class: 'slide'
				}
			}
		}
		splitRoot.push(splitNode)

		return currentIndex + 1
	}, 0)

	root.children = splitRoot as RootContent[]

	return join(size, ' ')
}
