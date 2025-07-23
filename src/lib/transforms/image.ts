import type { RootContentMap } from 'mdast'
import { join } from '../helper'
import {
	parseAxis,
	parseClass,
	parseDimensions,
	parseFilters,
	parseFit,
	parseId,
	parsePositionKey,
	parsePositions
} from './helper'

const parseFilterStyle = (value: string): string => {
	const filterValue = parseFilters(value)
	return filterValue ? `filter: ${filterValue}` : ''
}

const parseObjectFit = (value: string): string => {
	const fitValue = parseFit(value)
	return fitValue ? `object-fit: ${fitValue}` : 'object-fit: none'
}

const parseObjectPosition = (value: string): string => {
	const positionKey = parsePositionKey(value)
	if (positionKey) {
		return `object-position: ${positionKey}`
	}

	const positions = parseAxis(value)
	if (Object.keys(positions).length === 0) {
		return ''
	}

	const x = positions.x || '50%'
	const y = positions.y || '50%'
	return `object-position: ${x} ${y}`
}

const parseWidthHeight = (value: string): string[] => {
	const dimensions = parseDimensions(value)
	const width = dimensions.w ? `width: ${dimensions.w}` : ''
	const height = dimensions.h ? `height: ${dimensions.h}` : ''
	return [width, height]
}

const parsePositionStyles = (value: string): string[] => {
	const positions = parsePositions(value)
	const positionStyle: string[] = []
	for (const [positionKey, positionVal] of Object.entries(positions)) {
		positionStyle.push(`${positionKey}: ${positionVal}`)
	}
	return positionStyle
}

// const advanceBackground = (image: RootContentMap['image'], options: ImageEnhanceOptions) => {
// 	image.data = image.data || {}

// 	const url = 'background-image: url(' + image.url + ')'
// 	const filter = options.filters ? `background-filter: ${options.filters}` : ''

// 	const fit = options.fit ?? ''
// 	const width = options.dimensions?.width ?? 'auto'
// 	const height = options.dimensions?.height ?? 'auto'
// 	const size = fit || width || height ? `background-size: ${fit} ${width} ${height}` : ''

// 	const x = options.axis?.x ?? '0%'
// 	const y = options.axis?.y ?? '0%'
// 	const position = `background-position: ${x} ${y}`

// 	const style = (image.data.hProperties?.style as string) || ''
// 	const newStyles = [style, url, filter, size, position]

// 	image.data.hProperties = {
// 		...image.data.hProperties,
// 		style: join(newStyles, '; ')
// 	}
// }

export const processImage = (image: RootContentMap['image']) => {
	const imageAlt = image.alt || ''
	image.alt = imageAlt.split(' ')[0] || ''

	const filter = parseFilterStyle(imageAlt)
	const fit = parseObjectFit(imageAlt)
	const objectPos = parseObjectPosition(imageAlt)
	const widthHeight = parseWidthHeight(imageAlt)
	const positionStyle = parsePositionStyles(imageAlt)

	const isAbsolute = /absolute/g.test(imageAlt)
	const absolute = isAbsolute ? 'position: absolute' : ''

	image.data = image.data || {}

	const style = (image.data.hProperties?.style as string) || ''
	const newStyles = [style, filter, fit, objectPos, absolute, ...positionStyle, ...widthHeight]

	image.data.hProperties = {
		...image.data.hProperties,
		style: join(newStyles, '; ')
	}

	image.data.hProperties.class = `${image.data.hProperties.class || ''} ${parseClass(imageAlt)}`.trim()
	image.data.hProperties.id = `${image.data.hProperties.id || ''} ${parseId(imageAlt)}`.trim()

	return { isAbsolute }
}
