import type { RootContentMap } from 'mdast'
import { join, Parser } from './parser'

const parseFilterStyle = (parser: Parser): string => {
	const filterValue = parser.parseFilters()
	return filterValue ? `filter: ${filterValue}` : ''
}

const parseObjectFit = (parser: Parser): string => {
	const fitValue = parser.parseFit()
	return fitValue ? `object-fit: ${fitValue}` : 'object-fit: none'
}

const parseObjectPosition = (parser: Parser): string => {
	const positionKey = parser.parsePositionKey()
	if (positionKey) {
		return `object-position: ${positionKey}`
	}

	const positions = parser.parseAxis()
	if (Object.keys(positions).length === 0) {
		return ''
	}

	const x = positions.x || '50%'
	const y = positions.y || '50%'
	return `object-position: ${x} ${y}`
}

const parseWidthHeight = (parser: Parser): string[] => {
	const dimensions = parser.parseDimensions()
	const width = dimensions.w ? `width: ${dimensions.w}` : ''
	const height = dimensions.h ? `height: ${dimensions.h}` : ''
	return [width, height]
}

const parsePositionStyles = (parser: Parser): string[] => {
	const positions = parser.parsePositions()
	const positionStyle: string[] = []
	for (const [positionKey, positionVal] of Object.entries(positions)) {
		positionStyle.push(`${positionKey}: ${positionVal}`)
	}
	return positionStyle
}

export const transformImage = (image: RootContentMap['image']) => {
	const imageAlt = image.alt || ''
	image.alt = imageAlt.split(' ')[0]

	const parser = new Parser(imageAlt)

	const filter = parseFilterStyle(parser)
	const fit = parseObjectFit(parser)
	const objectPos = parseObjectPosition(parser)
	const widthHeight = parseWidthHeight(parser)
	const positionStyle = parsePositionStyles(parser)

	const attrs = parser.parseAttributes()

	const isAbsolute = Parser.isAbsolute(parser.value)
	const absolute = isAbsolute ? 'position: absolute' : ''

	image.data ??= {}
	const styles = [
		image.data.hProperties?.style as string,
		absolute,
		filter,
		fit,
		objectPos,
		...widthHeight,
		...positionStyle
	]

	image.data.hProperties = {
		...image.data.hProperties,
		...attrs,
		isAbsolute: isAbsolute,
		loading: 'lazy',
		style: join(styles, '; ')
	}

	image.data.hProperties.class = parser.parseClass(image.data.hProperties.class as string)
	image.data.hProperties.id = parser.parseId(image.data.hProperties.id as string)
}
