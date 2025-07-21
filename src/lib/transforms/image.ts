import type { RootContentMap } from 'mdast'
import { join } from '../helper'
import { parseClass, parseId } from './helper'
import { regexp } from './regexp'

const defaultFilters: Record<string, string> = {
	blur: '10px',
	brightness: '1.5',
	contrast: '2',
	grayscale: '1',
	'hue-rotate': '180deg',
	invert: '1',
	opacity: '0.5',
	saturate: '2',
	sepia: '1',
	'drop-shadow': '2px 2px 5px rgba(0, 0, 0, 0.5)'
}

const dimensionsKey: Record<string, string> = {
	w: 'width',
	h: 'height'
}

// Parses filters from a string and returns them as a CSS property
// It handles cases like blur: 2px, brightness: 1.5, contrast: 2
// It returns a string like "filter: blur(2px); brightness(1.5); contrast(2)"
// If no filters are found, it returns an empty string
const parseFilters = (value: string): string => {
	const filters: string[] = []
	for (const match of value.matchAll(regexp.filter)) {
		const key = match[1]
		const val = match[2]?.replace(regexp.quote, '') || defaultFilters[key]
		filters.push(`${key}(${val})`)
	}
	if (filters.length === 0) {
		return ''
	}
	return `filter: ${filters.join(' ')}`
}

// Parses object-fit from a string and returns it as a CSS property
// It handles cases like object-fit: cover, object-fit: contain
// It returns a string like "object-fit: cover"
// If no object-fit is found, it returns an empty string
const parseObjectFit = (value: string): string => {
	const match = value.match(regexp.objectFit)
	return match ? `object-fit: ${match[0]}` : ''
}

// Parses dimensions from a string and returns them as a CSS property
// It handles cases like w:100px, h:200px, w:50%, h:50%
// It returns a string like "width: 100px; height: 200px"
// or "width: 50%; height: 50%"
// If no dimensions are found, it returns an empty string
const parseDimensions = (value: string): string => {
	const dimensions = []
	for (const match of value.matchAll(regexp.dimensions)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')

		dimensions.push(`${dimensionsKey[key]}: ${val}`)
	}

	return dimensions.join(';')
}

export const processImage = (image: RootContentMap['image']) => {
	const imageAlt = image.alt || ''
	const [alt, ...rest] = imageAlt.split(' ')
	const restAlt = rest.join(' ')

	const filters = parseFilters(restAlt)
	const objectFit = parseObjectFit(restAlt)
	const dimensions = parseDimensions(restAlt)

	let absolute = ''
	if (rest.includes('absolute')) {
		absolute = 'position: absolute;'
	}

	image.alt = alt
	image.data = image.data || {}

	const style = (image.data.hProperties?.style as string) || ''
	image.data.hProperties = {
		...image.data.hProperties,
		style: join([style, filters, objectFit, dimensions, absolute], '; ')
	}

	image.data.hProperties.class = parseClass(restAlt) || image.data.hProperties.class
	image.data.hProperties.id = parseId(restAlt) || image.data.hProperties.id

	return {
		isAbsolute: absolute !== '',
		properties: image.data.hProperties
	}
}
