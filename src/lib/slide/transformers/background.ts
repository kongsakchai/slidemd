import type { Node, RootContentMap } from 'mdast'
import { join, Parser } from './parser'

// default is empty string
const parseBackgroundFilter = (parser: Parser): string => {
	const filterValue = parser.parseFilters()
	return filterValue ? `background-filter: ${filterValue}` : ''
}

// default is empty
const parseBackgroundSize = (parser: Parser): string => {
	const fitValue = parser.parseFit()
	if (fitValue) {
		return `background-size: ${fitValue}`
	}

	const dimensions = parser.parseDimensions()
	if (Object.keys(dimensions).length === 0) {
		return ''
	}

	const width = dimensions.w || 'auto'
	const height = dimensions.h || 'auto'
	return `background-size: ${width} ${height}`
}

// default is center
const parseBackgroundPosition = (parser: Parser): string => {
	const pos = parser.parsePositionKey()
	if (pos) {
		return `background-position: ${pos}`
	}

	const positions = parser.parseAxis()
	if (Object.keys(positions).length === 0) {
		return `background-position: center`
	}

	const x = positions.x || '50%'
	const y = positions.y || '50%'
	return `background-position: ${x} ${y}`
}

// default is no-repeat
const parseBackgroundRepeat = (parser: Parser): string => {
	const repeat = parser.parseRepeat()
	if (repeat) {
		return `background-repeat: ${repeat}`
	}

	const repeatAxis = parser.parseRepeatAxis()
	if (Object.keys(repeatAxis).length === 0) {
		return `background-repeat: no-repeat`
	}

	const x = repeatAxis['repeat-x'] || 'no-repeat'
	const y = repeatAxis['repeat-y'] || 'no-repeat'
	return `background-repeat: ${x} ${y}`
}

export const transformBackground = (image: RootContentMap['image']) => {
	const imageAlt = image.alt || ''
	const parser = new Parser(imageAlt)

	const url = 'background-image: url(' + image.url + ')'
	const filter = parseBackgroundFilter(parser) // default no filter
	const size = parseBackgroundSize(parser) // default no size
	const position = parseBackgroundPosition(parser) // default center
	const repeat = parseBackgroundRepeat(parser) // default no-repeat
	const sizeGrid = parser.parseValueWithUnit() // default empty string

	const isVertical = Parser.isVertical(parser.value)
	const newStyles = [image.data?.hProperties?.style as string, url, filter, size, position, repeat]

	image.data ??= {}
	image.data.hProperties = {
		...image.data.hProperties,
		style: join(newStyles, '; '),
		isVertical,
		sizeGrid
	}

	const baseClass = 'background-image ' + (image.data.hProperties.class || '')
	image.data.hProperties.class = parser.parseClass(baseClass)
	image.data.hProperties.id = parser.parseId(image.data.hProperties.id as string)

	return { type: 'bg', data: image.data } as Node
}
