// (?<=^|\s) is used to ensure that the regex matches only at the start of a line or after a space
// (?=\s|$) is used to ensure that the regex matches only at the end of a line or before a space
export const regexp = {
	attributes: /(.*?)\s*([^\s=:]+)[=:](^["'].*?["']$|[^\s]+)/g,
	quote: /^["']|["']$/,
	class: /^\.[^\s]+$/,
	id: /^#[^\s]+$/,

	filter: /^(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|drop-shadow)(?::\s*(^["'].*?["']$|[^\s]+))?$/g,
	fit: /^(cover|contain)$/,
	dimensions: /^(w|h):\s*([^\s]+)$/g,
	axis: /^(x|y):\s*([^\s]+)$/g,
	positionKey: /^(top|right|bottom|left)$/,
	position: /^(top|right|bottom|left):\s*([^\s]+)$/g,
	percentage: /^(\d+)%$/
}

export const defaultFilters: Record<string, string> = {
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

const splitMatch = (value: string, regex: RegExp) => {
	const matches: string[] = []
	for (const val of value.split(' ')) {
		const match = val.match(regex)
		if (match && match.length > 0) matches.push(match[0])
	}
	return matches
}

const splitMatchAll = (value: string, regex: RegExp) => {
	const matches: string[][] = []
	for (const val of value.split(' ')) {
		const match = val.matchAll(regex)
		if (match) {
			for (const m of match) {
				if (m && m.length > 0) matches.push(m)
			}
		}
	}
	return matches
}

// Parses attributes from a string and returns them as an object
// This handles cases where attributes are defined in HTML comments like <!-- attr: value -->
// It extracts key-value pairs and returns them as an object
// - For example, \<!-- attr1: value1 attr2: value2 --> will return { attr1: 'value1', attr2: 'value2' }
// - For example, \<!-- attr1: "value1-1 value1-2" attr2: "value2" --> will return { attr1: 'value1-1 value1-2', attr2: 'value2' }
// - It also handles cases where attributes are defined in the form of key="value" or key='value'
// - For example, \<!-- attr1="value1" attr2='value2' --> will also return { attr1: 'value1', attr2: 'value2' }
export const parseAttributes = (value: string): Record<string, string> => {
	const attrs: Record<string, string> = {}

	for (const match of splitMatchAll(value, regexp.attributes)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		attrs[key] = val
	}

	return attrs
}

// This handles cases where IDs are defined in attributes like #id-name
export const parseId = (value: string): string => {
	return (
		splitMatch(value, regexp.id)
			.map((id) => id.slice(1))
			.join(' ') || ''
	)
}

// Extracts class names from a string, ignoring the leading dot.
// This handles cases where class names are defined in attributes like .class-name
export const parseClass = (value: string): string => {
	return (
		splitMatch(value, regexp.class)
			.map((className) => className.slice(1))
			.join(' ') || ''
	)
}

// Parses filters from a string and returns them as a CSS property
// It handles cases like blur: 2px, brightness: 1.5, contrast: 2
export const parseFilters = (value: string): string => {
	const filters: string[] = []
	for (const match of splitMatchAll(value, regexp.filter)) {
		const key = match[1]
		const val = match[2]?.replace(regexp.quote, '') || defaultFilters[key]
		filters.push(`${key}(${val})`)
	}
	if (filters.length === 0) {
		return ''
	}
	return `${filters.join(' ')}`
}

// Parses fit from a string and returns it as a CSS property
// It handles cases like cover, contain, none
export const parseFit = (value: string): string => {
	const match = splitMatch(value, regexp.fit)
	return match.length > 0 ? match[0] : ''
}

// Parses axis from a string and returns it as an object
// It handles cases like w: 100px, h: 200px
export const parseDimensions = (value: string): Record<string, string> => {
	const dimensions: Record<string, string> = {}
	for (const match of splitMatchAll(value, regexp.dimensions)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		dimensions[key] = val
	}
	return dimensions
}

// Parses axis from a string and returns it as an object
// It handles cases like x: 50%, y: 50%
export const parseAxis = (value: string): Record<string, string> => {
	const axis: Record<string, string> = {}
	for (const match of splitMatchAll(value, regexp.axis)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		axis[key] = val
	}
	return axis
}

export const parsePositionKey = (value: string): string => {
	const match = splitMatch(value, regexp.positionKey)
	return match.length > 0 ? match[0] : ''
}

// Parses positions from a string and returns them as an object
// It handles cases like top: 10px, right: 20px, bottom: 30px, left: 40px
export const parsePositions = (value: string): Record<string, string> => {
	const positions: Record<string, string> = {}
	for (const match of splitMatchAll(value, regexp.position)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		positions[key] = val
	}
	return positions
}
