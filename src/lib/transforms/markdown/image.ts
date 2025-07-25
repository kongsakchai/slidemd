import type { Parent, RootContentMap } from 'mdast'
import {
	join,
	parseAxis,
	parseClass,
	parseDimensions,
	parseFilters,
	parseFit,
	parseId,
	parsePositionKey,
	parsePositions,
	regexp
} from './parser'

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

export const processImage = (image: RootContentMap['image'], parent: Parent) => {
	const imageAlt = image.alt || ''
	image.alt = imageAlt.split(' ')[0] || ''

	const filter = parseFilterStyle(imageAlt)
	const fit = parseObjectFit(imageAlt)
	const objectPos = parseObjectPosition(imageAlt)
	const widthHeight = parseWidthHeight(imageAlt)
	const positionStyle = parsePositionStyles(imageAlt)

	const isAbsolute = regexp.absoluteKey.test(imageAlt)
	const absolute = isAbsolute ? 'position: absolute' : ''

	image.data = image.data || {}
	image.data.hProperties = image.data.hProperties || {}

	const style = (image.data.hProperties?.style as string) || ''
	const newStyles = [style, filter, fit, objectPos, absolute, ...positionStyle, ...widthHeight]

	const baseClass = (image.data.hProperties.class as string) || ''
	const className = parseClass(imageAlt, baseClass)

	const baseId = (image.data.hProperties.id as string) || ''
	const id = parseId(imageAlt, baseId)

	image.data.hProperties = {
		...image.data.hProperties,
		style: join(newStyles, '; '),
		class: className,
		id
	}

	if (isAbsolute) {
		setParentContents(parent)
	}
}

const setParentContents = (parent: Parent) => {
	const contents = parent.children.every((child) => {
		return child.type === 'image' && child.data?.hProperties?.isAbsolute
	})
	if (!contents) return

	parent.data = parent.data || {}

	const styles = `display:contents; ${parent.data.hProperties?.style || ''}`

	parent.data.hProperties = {
		...parent.data.hProperties,
		style: styles
	}
}
