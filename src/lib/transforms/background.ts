import { join } from '$lib/helper'
import type { Node, Parent, Root, RootContent, RootContentMap } from 'mdast'
import {
	parseAxis,
	parseClass,
	parseDimensions,
	parseFilters,
	parseFit,
	parseId,
	parsePositionKey,
	parseRepeat,
	parseRepeatAxis,
	regexp
} from './parser'

const parseBackgroundFilter = (value: string): string => {
	const filterValue = parseFilters(value)
	return filterValue ? `background-filter: ${filterValue}` : ''
}

const parseBackgroundSize = (value: string): string => {
	const key = 'background-size:'
	const fitValue = parseFit(value)
	if (fitValue) {
		return key + fitValue
	}

	const dimensions = parseDimensions(value)
	if (Object.keys(dimensions).length === 0) {
		return ''
	}

	const width = dimensions.w || 'auto'
	const height = dimensions.h || 'auto'
	return key + `${width} ${height}`
}

const parseBackgroundPosition = (value: string): string => {
	const key = 'background-position:'
	const pos = parsePositionKey(value)
	if (pos) {
		return key + pos
	}

	const positions = parseAxis(value)
	// If no positions are specified, default to center
	if (Object.keys(positions).length === 0) {
		return key + 'center'
	}

	const x = positions.x || '50%'
	const y = positions.y || '50%'
	return key + `${x} ${y}`
}

const parseBackgroundRepeat = (value: string): string => {
	const key = 'background-repeat:'
	const repeat = parseRepeat(value)
	if (repeat) {
		return key + repeat
	}

	const repeatAxis = parseRepeatAxis(value)
	// If no repeat axis is specified, default to no-repeat
	if (Object.keys(repeatAxis).length === 0) {
		return key + 'no-repeat'
	}

	const x = repeatAxis['repeat-x'] || 'no-repeat'
	const y = repeatAxis['repeat-y'] || 'no-repeat'
	return key + `${x} ${y}`
}

export const processBackground = (image: RootContentMap['image'], parent: Parent) => {
	const imageAlt = image.alt || ''

	const url = 'background-image: url(' + image.url + ')'
	const filter = parseBackgroundFilter(imageAlt) // default no filter
	const size = parseBackgroundSize(imageAlt) // default no size
	const position = parseBackgroundPosition(imageAlt) // default center
	const repeat = parseBackgroundRepeat(imageAlt) // default no-repeat

	image.data = image.data || {}

	const style = (image.data.hProperties?.style as string) || ''
	const newStyles = [style, url, filter, size, position, repeat]

	const isVertical = regexp.verticalKey.test(imageAlt)

	image.data.hProperties = {
		...image.data.hProperties,
		isVertical,
		style: join(newStyles, '; ')
	}

	const baseClass = (image.data.hProperties.class as string) || ''
	image.data.hProperties.class = parseClass(imageAlt, baseClass) + ' background-image'

	const baseId = (image.data.hProperties.id as string) || ''
	image.data.hProperties.id = parseId(imageAlt, baseId)

	const index = parent.children.indexOf(image)
	parent.children.splice(index, 1)

	return { type: 'bg', data: image.data } as Node
}

export const appendBackgroundContainer = (images: Node[], tree: Root) => {
	const className = 'background-container'
	const vertical = images.some((image) => image.data?.hProperties?.isVertical)
	const sizeGrid = (vertical ? '--bg-rows: ' : '--bg-columns: ') + images.length

	const container: Parent = {
		type: 'bg-container',
		data: {
			hProperties: {
				class: className,
				style: sizeGrid
			}
		},
		children: images as RootContent[]
	}
	tree.children.push(container as RootContent)
}
