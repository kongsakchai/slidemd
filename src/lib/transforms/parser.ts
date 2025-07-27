export const join = (arr: (string | undefined)[], separator: string): string => {
	const result = arr.filter(Boolean).join(separator)
	const replaceRex = new RegExp(`${separator}{2,}`, 'g')

	return result.replaceAll(replaceRex, separator).trim()
}

// (?<=^|\s) is used to ensure that the regex matches only at the start of a line or after a space
// (?=\s|$) is used to ensure that the regex matches only at the end of a line or before a space
export const regexp = {
	attributes: /(?<=^|\s)([^\s=:.]+)[=:](["'].*?["']|[^\s]+)(?=\s|$)/g,
	quote: /^["']|["']$/g,

	class: /(?<=^|\s)\.[^\s]+(?=\s|$)/g,
	id: /(?<=^|\s)#[^\s]+(?=\s|$)/g,

	dimensions: /(?<=^|\s)(w|h):([^\s]+)(?=\s|$)/g,
	axis: /(?<=^|\s)(x|y):([^\s]+)(?=\s|$)/g,
	positionKey: /(?<=^|\s)(top|right|bottom|left|center)(?=\s|$)/g,
	position: /(?<=^|\s)(top|right|bottom|left):([^\s]+)(?=\s|$)/g,

	valueWithUnit: /(?<=^|\s)\d+(px|pt|em|rem|%)(?=\s|$)/g,

	filter: /(?<=^|\s)(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|drop-shadow)(?::(["'].*?["']|[^\s]+))?(?=\s|$)/g,
	repeatKey: /(?<=^|\s)(repeat|no-repeat|repeat-x|repeat-y|space|round)(?=\s|$)/g,
	repeatAxis: /(?<=^|\s)(repeat-x|repeat-y):(repeat|no-repeat|space|round)(?=\s|$)/g,
	fit: /(?<=^|\s)(cover|contain|fill)(?=\s|$)/g,

	// keywords
	comment: /^<!--[\s\S]*?-->$/,
	split: /(?<=^|\s)split(?::([^\s]+))?(?=\s|$)/,
	bgKey: /(?<=^|\s)bg(?=\s|$)/,
	absoluteKey: /(?<=^|\s)absolute(?=\s|$)/,
	verticalKey: /(?<=^|\s)vertical(?=\s|$)/
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

// Parses attributes from a string and returns them as an object
// This handles cases where attributes are defined in HTML comments like <!-- attr: value -->
// It extracts key-value pairs and returns them as an object
// - For example, \<!-- attr1: value1 attr2: value2 --> will return { attr1: 'value1', attr2: 'value2' }
// - For example, \<!-- attr1: "value1-1 value1-2" attr2: "value2" --> will return { attr1: 'value1-1 value1-2', attr2: 'value2' }
// - It also handles cases where attributes are defined in the form of key="value" or key='value'
// - For example, \<!-- attr1="value1" attr2='value2' --> will also return { attr1: 'value1', attr2: 'value2' }
export const parseAttributes = (value: string): Record<string, string> => {
	const attrs: Record<string, string> = {}

	for (const match of value.matchAll(regexp.attributes)) {
		const key = match[1]
		const val = match[2].replaceAll(regexp.quote, '')
		attrs[key] = val
	}

	return attrs
}

// This handles cases where IDs are defined in attributes like #id-name
export const parseId = (value: string, base?: string): string => {
	const val = value.match(regexp.id)?.map((id) => id.slice(1)) || []
	return join([base, ...val], ' ')
}

// Extracts class names from a string, ignoring the leading dot.
// This handles cases where class names are defined in attributes like .class-name
export const parseClass = (value: string, base?: string): string => {
	const match = value.match(regexp.class)?.map((cls) => cls.slice(1)) || []
	return join([base, ...match], ' ')
}

// Parses filters from a string and returns them as a CSS property
// It handles cases like blur: 2px, brightness: 1.5, contrast: 2
export const parseFilters = (value: string): string => {
	const filters: string[] = []
	for (const match of value.matchAll(regexp.filter)) {
		const key = match[1]
		const val = match[2]?.replace(regexp.quote, '') || defaultFilters[key]
		filters.push(`${key}(${val})`)
	}
	if (filters.length === 0) {
		return ''
	}
	return filters.join(' ')
}

// Parses fit from a string and returns it as a CSS property
// It handles cases like cover, contain, none
export const parseFit = (value: string): string => {
	const match = value.match(regexp.fit)
	return match?.pop() || ''
}

// Parses axis from a string and returns it as an object
// It handles cases like w: 100px, h: 200px
export const parseDimensions = (value: string): Record<string, string> => {
	const dimensions: Record<string, string> = {}
	for (const match of value.matchAll(regexp.dimensions)) {
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
	for (const match of value.matchAll(regexp.axis)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		axis[key] = val
	}
	return axis
}

// Parses position key from a string and returns it as a string
// It handles cases like top, right, bottom, left
export const parsePositionKey = (value: string): string => {
	const match = value.match(regexp.positionKey)
	return match?.pop() || ''
}

// Parses positions from a string and returns them as an object
// It handles cases like top: 10px, right: 20px, bottom: 30px, left: 40px
export const parsePositions = (value: string): Record<string, string> => {
	const positions: Record<string, string> = {}
	for (const match of value.matchAll(regexp.position)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		positions[key] = val
	}
	return positions
}

// Parses repeat from a string and returns it as a string
// It handles cases like repeat, no-repeat, repeat-x, repeat-y, space, round
export const parseRepeat = (value: string): string => {
	const match = value.match(regexp.repeatKey)
	return match?.pop() || ''
}

// Parses repeat axis from a string and returns it as an object
// It handles cases like repeat-x: repeat, repeat-y: no-repeat
export const parseRepeatAxis = (value: string): Record<string, string> => {
	const repeatAxis: Record<string, string> = {}
	for (const match of value.matchAll(regexp.repeatAxis)) {
		const key = match[1]
		const val = match[2].replace(regexp.quote, '')
		repeatAxis[key] = val
	}
	return repeatAxis
}

// Parses a value with unit from a string and returns it as a string
// It handles cases like 100px, 50%, 1.5em, 2rem
export const parseValueWithUnit = (value: string): string => {
	const match = value.match(regexp.valueWithUnit)
	return match?.pop() || ''
}

// Parses split directive from a string and returns it as an object
export const parseSplit = (value: string): string => {
	const match = value.match(regexp.split)
	return match?.pop() || ''
}
