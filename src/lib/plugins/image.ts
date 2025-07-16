import type { Parent, Root, RootContent } from 'mdast'
import { join } from '../utils'

const regexp = {
	filter: /(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|drop-shadow)(?::\s*(^["'].*?["']$|[^\s]+))?/g,
	objectFit: /cover|contain|none/,
	dimensions: /(w|h):\s*([^\s]+)/g,
	quote: /^["']|["']$/g,
	percentage: /(\d+)%/
}

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

// filter elements that have images
// Images are defined in the last child of the element in the form of HTML comments
const filterImageParents = (node: RootContent): boolean => {
	return node.type === 'paragraph' && node.children.some((child) => child.type === 'image')
}

const parseFilters = (value: string): string => {
	const filters: string[] = []
	for (const match of value.matchAll(regexp.filter)) {
		const key = match[1]
		const val = match[2]?.replace(regexp.quote, '') || defaultFilters[key]
		filters.push(`${key}(${val})`)
	}
	return `filter: ${filters.join(' ')}`
}

const parseObjectFit = (value: string): string => {
	const match = value.match(regexp.objectFit)
	return match ? `object-fit: ${match[0]}` : ''
}

const parseDimensions = (value: string): string => {
	const dimensions = []
	for (const match of value.matchAll(regexp.dimensions)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')

		dimensions.push(`${dimensionsKey[key]}: ${val}`)
	}

	return dimensions.join(';')
}

export const imagePlugin = () => {
	return (tree: Root) => {
		const filter = tree.children.filter(filterImageParents)
		filter.forEach((node) => {
			const parent = node as Parent
			const img = parent.children.filter((child) => child.type === 'image')
			img.forEach((image) => {
				if (!image.alt) return
				const [alt, ...rest] = image.alt.split(' ')
				const restAlt = rest.join(' ')

				const filters = parseFilters(restAlt)
				const objectFit = parseObjectFit(restAlt)
				const dimensions = parseDimensions(restAlt)

				image.alt = alt
				image.data = image.data || {}
				image.data.hProperties = {
					...image.data.hProperties,
					style: join([filters, objectFit, dimensions], ';')
				}
			})
		})
	}
}
