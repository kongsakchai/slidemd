import type { Node, Parent, RootContent, RootContentMap } from 'mdast'
import { visit } from 'unist-util-visit'
import {
	join,
	parseAxis,
	parseClass,
	parseDimensions,
	parseFilters,
	parseFit,
	parseId,
	parsePositionKey,
	parseRepeat,
	parseRepeatAxis,
	parseValueWithUnit,
	regexp
} from './parser'

// default is empty string
const parseBackgroundFilter = (value: string): string => {
	const filterValue = parseFilters(value)
	return filterValue ? `background-filter: ${filterValue}` : ''
}

// default is empty
const parseBackgroundSize = (value: string): string => {
	const fitValue = parseFit(value)
	if (fitValue) {
		return `background-size: ${fitValue}`
	}

	const dimensions = parseDimensions(value)
	if (Object.keys(dimensions).length === 0) {
		return ''
	}

	const width = dimensions.w || 'auto'
	const height = dimensions.h || 'auto'
	return `background-size: ${width} ${height}`
}

// default is center
const parseBackgroundPosition = (value: string): string => {
	const pos = parsePositionKey(value)
	if (pos) {
		return `background-position: ${pos}`
	}

	const positions = parseAxis(value)
	if (Object.keys(positions).length === 0) {
		return `background-position: center`
	}

	const x = positions.x || '50%'
	const y = positions.y || '50%'
	return `background-position: ${x} ${y}`
}

// default is no-repeat
const parseBackgroundRepeat = (value: string): string => {
	const repeat = parseRepeat(value)
	if (repeat) {
		return `background-repeat: ${repeat}`
	}

	const repeatAxis = parseRepeatAxis(value)
	if (Object.keys(repeatAxis).length === 0) {
		return `background-repeat: no-repeat`
	}

	const x = repeatAxis['repeat-x'] || 'no-repeat'
	const y = repeatAxis['repeat-y'] || 'no-repeat'
	return `background-repeat: ${x} ${y}`
}

export const parseBackground = (image: RootContentMap['image'], index: number, parent: Parent, root: Parent) => {
	const imageAlt = image.alt || ''

	const url = 'background-image: url(' + image.url + ')'
	const filter = parseBackgroundFilter(imageAlt) // default no filter
	const size = parseBackgroundSize(imageAlt) // default no size
	const position = parseBackgroundPosition(imageAlt) // default center
	const repeat = parseBackgroundRepeat(imageAlt) // default no-repeat
	const sizeGrid = parseValueWithUnit(imageAlt) // default empty string

	image.data ||= {}
	image.data.hProperties ||= {}

	const newStyles = [image.data.hProperties?.style as string, url, filter, size, position, repeat]

	const isVertical = regexp.verticalKey.test(imageAlt)

	const baseClass = 'background-image ' + (image.data.hProperties.class || '')
	const className = parseClass(imageAlt, baseClass)

	const id = parseId(imageAlt, image.data.hProperties.id as string)

	image.data.hProperties = {
		...image.data.hProperties,
		style: join(newStyles, '; '),
		isVertical,
		sizeGrid,
		class: className,
		id
	}
	parent.children.splice(index, 1)
	clearParent(root, parent)

	return { type: 'bg', data: image.data } as Node
}

const clearParent = (root: Parent, parent: Parent) => {
	let loop = true

	while (loop) {
		if (parent.children.length > 0) {
			const emptyChildren = parent.children.every((child) => {
				return child.type === 'text' && child.value.trim() === ''
			})

			if (!emptyChildren) return
		}

		visit(root, parent, (_, index, parentNode) => {
			if (typeof index !== 'number' || !parentNode) {
				loop = false
				return
			}

			parentNode.children.splice(index, 1)
			parent = parentNode
		})
	}
}

export const makeBackgroundContainer = (images: Node[]) => {
	const className = 'background-container'

	const vertical = images.some((image) => image.data?.hProperties?.isVertical)

	const sizeGrids = images.map((image) => image.data?.hProperties?.sizeGrid || '1fr')
	const gridTemplate = (vertical ? '--bg-rows: ' : '--bg-columns: ') + sizeGrids.join(' ')

	return {
		type: 'bg-container',
		data: {
			hProperties: {
				class: className,
				style: gridTemplate
			}
		},
		children: images as RootContent[]
	} as Parent
}
