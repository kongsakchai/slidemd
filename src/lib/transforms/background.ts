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
	parseRepeatAxis
} from './helper'

const parseBackgroundFilter = (value: string): string => {
	const filterValue = parseFilters(value)
	return filterValue ? `background-filter: ${filterValue}` : ''
}

const parseBackgroundSize = (value: string): string => {
	const fitValue = parseFit(value)
	const dimensions = parseDimensions(value)
	const width = dimensions.w || 'auto'
	const height = dimensions.h || 'auto'

	if (!fitValue && width === 'auto' && height === 'auto') {
		return ''
	}

	return `background-size: ${fitValue} ${width} ${height}`
}

const parseBackgroundPosition = (value: string): string => {
	const pos = parsePositionKey(value)
	if (pos) {
		return `background-position: ${pos}`
	}

	const positions = parseAxis(value)
	if (Object.keys(positions).length === 0) {
		return ''
	}

	const x = positions.x || '0%'
	const y = positions.y || '0%'
	return `background-position: ${x} ${y}`
}

const parseBackgroundRepeat = (value: string): string => {
	const repeat = parseRepeat(value)
	if (repeat) {
		return `background-repeat: ${repeat}`
	}

	const repeatAxis = parseRepeatAxis(value)
	if (Object.keys(repeatAxis).length === 0) {
		return ''
	}

	const x = repeatAxis['repeat-x'] || 'no-repeat'
	const y = repeatAxis['repeat-y'] || 'no-repeat'
	return `background-repeat: ${x} ${y}`
}

export const processBackground = (image: RootContentMap['image'], parent: Parent) => {
	const imageAlt = image.alt || ''

	const url = 'background-image: url(' + image.url + ')'
	const filter = parseBackgroundFilter(imageAlt)
	const size = parseBackgroundSize(imageAlt)
	const position = parseBackgroundPosition(imageAlt)
	const repeat = parseBackgroundRepeat(imageAlt)

	image.data = image.data || {}

	const style = (image.data.hProperties?.style as string) || ''
	const newStyles = [style, url, filter, size, position, repeat]

	image.data.hProperties = {
		...image.data.hProperties,
		style: join(newStyles, '; ')
	}

	const className = parseClass(imageAlt) + ' background-image'
	if (className) {
		image.data.hProperties.class = `${className} ${image.data.hProperties.class || ''}`.trim()
	}
	const id = parseId(imageAlt)
	if (id) {
		image.data.hProperties.id = `${id} ${image.data.hProperties.id || ''}`.trim()
	}

	const index = parent.children.indexOf(image)
	parent.children.splice(index, 1)

	return { type: 'bg', data: image.data } as Node
}

export const appendBackgroundContainer = (images: Node[], tree: Root) => {
	const container: Parent = {
		type: 'bg-container',
		data: {
			hProperties: {
				class: 'background-container'
			}
		},
		children: images as RootContent[]
	}
	tree.children.push(container as RootContent)
}
