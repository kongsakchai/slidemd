import type { Node, RootContentMap } from 'mdast'
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

export const transformBackground = (image: RootContentMap['image']) => {
	const imageAlt = image.alt || ''

	const url = 'background-image: url(' + image.url + ')'
	const filter = parseBackgroundFilter(imageAlt) // default no filter
	const size = parseBackgroundSize(imageAlt) // default no size
	const position = parseBackgroundPosition(imageAlt) // default center
	const repeat = parseBackgroundRepeat(imageAlt) // default no-repeat
	const sizeGrid = parseValueWithUnit(imageAlt) // default empty string

	image.data ||= {}
	image.data.hProperties ||= {}

	const isVertical = regexp.verticalKey.test(imageAlt)
	const newStyles = [image.data.hProperties?.style as string, url, filter, size, position, repeat]

	image.data.hProperties = {
		...image.data.hProperties,
		style: join(newStyles, '; '),
		isVertical,
		sizeGrid
	}

	const baseClass = 'background-image ' + (image.data.hProperties.class || '')
	image.data.hProperties.class = parseClass(imageAlt, baseClass)
	image.data.hProperties.id = parseId(imageAlt, image.data.hProperties.id as string)

	return { type: 'bg', data: image.data } as Node
}
