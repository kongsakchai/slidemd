export const join = (arr: (string | undefined)[], separator: string): string | undefined => {
	if (arr.length === 0) return undefined

	const result = arr.filter(Boolean).join(separator)
	const replaceRex = new RegExp(`${separator}{2,}`, 'g')

	return result.replaceAll(replaceRex, separator).trim()
}

// (?<=^|\s) is used to ensure that the regex matches only at the start of a line or after a space
// (?=\s|$) is used to ensure that the regex matches only at the end of a line or before a space
export const regexp = {
	attributes: /(?<=^|\s)(\w+)[=:](?:"(.*)"|'(.*)'|([^\s]+))(?=\s|$)/g,
	quote: /^["']|["']$/g,

	class: /(?<=^|\s)\.([^\s]+)(?=$|\s)/g,
	id: /(?<=^|\s)#([^\s]+)(?=\s|$)/g,

	dimensions: /(?<=^|\s)(w|h):(?:"(.*)"|'(.*)'|([^\s]+))(?=\s|$)/g,
	axis: /(?<=^|\s)(x|y):(?:"(.*)"|'(.*)'|([^\s]+))(?=\s|$)/g,
	positionKey: /(?<=^|\s)(top|right|bottom|left|center)(?=\s|$)/g,
	position: /(?<=^|\s)(top|right|bottom|left):(?:"(.*)"|'(.*)'|([^\s]+))(?=\s|$)/g,

	valueWithUnit: /(?<=^|\s)\d+(px|pt|em|rem|%)(?=\s|$)/g,

	filter: /(?<=^|\s)(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|drop-shadow)(?::"(.*)"|:'(.*)'|:([^\s]+))?(?=\s|$)/g,
	repeatKey: /(?<=^|\s)(repeat|no-repeat|repeat-x|repeat-y|space|round)(?=\s|$)/g,
	repeatAxis: /(?<=^|\s)(repeat-x|repeat-y):(repeat|no-repeat|space|round)(?=\s|$)/g,
	fit: /(?<=^|\s)(cover|contain|fill)(?=\s|$)/g,

	clickAttributes: /(\d+):(?:"(.*)"|'(.*)'|([^\s]+))(?=\s|$)/g,

	// keywords
	comment: /^<!--[\s\S]*?-->$/,
	split: /^<!--\s*split(?::"(.*)"|:'(.*)'|:([^\s]+))?\s*-->$/g,
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

interface Match {
	index: number
	offset: number
}

export class Parser {
	value: string

	#matchedList: Match[]

	constructor(value: string) {
		this.value = value

		this.#matchedList = []
	}

	private addMatchedList(index: number, length: number) {
		this.#matchedList.push({ index, offset: index + length })
	}

	private clearValue() {
		let newValue = ''
		let start = 0
		for (const { index, offset } of this.#matchedList) {
			newValue += this.value.slice(start, index)
			start = offset
		}
		if (start < this.value.length) {
			newValue += this.value.slice(start)
		}

		this.value = newValue
		this.#matchedList = []
	}

	static isComment(value: string): boolean {
		return value.match(regexp.comment) !== null
	}

	static isSplit(value: string): boolean {
		return value.match(regexp.split) !== null
	}

	static isVertical(value: string): boolean {
		return value.match(regexp.verticalKey) !== null
	}

	static isAbsolute(value: string): boolean {
		return value.match(regexp.absoluteKey) !== null
	}

	static isBackground(value: string): boolean {
		return value.match(regexp.bgKey) !== null
	}

	newValue(value: string) {
		this.value = value
		this.#matchedList = []
		return this
	}

	// Parses attributes from a string and returns them as an object
	// This handles cases where attributes are defined in HTML comments like <!-- attr: value -->
	// It extracts key-value pairs and returns them as an object
	// - For example, \<!-- attr1: value1 attr2: value2 --> will return { attr1: 'value1', attr2: 'value2' }
	// - For example, \<!-- attr1: "value1-1 value1-2" attr2: "value2" --> will return { attr1: 'value1-1 value1-2', attr2: 'value2' }
	// - It also handles cases where attributes are defined in the form of key="value" or key='value'
	// - For example, \<!-- attr1="value1" attr2='value2' --> will also return { attr1: 'value1', attr2: 'value2' }
	parseAttributes(): Record<string, string | undefined> {
		const attrs: Record<string, string | undefined> = {}
		for (const match of this.value.matchAll(regexp.attributes)) {
			this.addMatchedList(match.index, match[0].length)

			const key = match[1]
			const val = match[2] ?? match[3] ?? match[4]
			attrs[key] = join([attrs[key], val], ' ')
		}
		this.clearValue()
		return attrs
	}

	// This handles cases where IDs are defined in attributes like #id-name
	parseId = (base?: string): string | undefined => {
		const val = this.value.matchAll(regexp.id).map((id) => {
			this.addMatchedList(id.index, id[0].length)
			return id[1]
		})

		this.clearValue()
		return join([base, ...val], ' ') || undefined
	}

	// Extracts class names from a string, ignoring the leading dot.
	// This handles cases where class names are defined in attributes like .class-name
	// this handles cases like .class1.class2.class3
	parseClass(base?: string) {
		const match = this.value.matchAll(regexp.class).flatMap((classes) => {
			this.addMatchedList(classes.index, classes[0].length)
			return classes[1].split('.')
		})

		this.clearValue()
		return join([base, ...match], ' ') || undefined
	}

	// Parses filters from a string and returns them as a CSS property
	// It handles cases like blur: 2px, brightness: 1.5, contrast: 2
	parseFilters = (): string => {
		const filters: string[] = []
		for (const match of this.value.matchAll(regexp.filter)) {
			this.addMatchedList(match.index, match[0].length)

			const key = match[1]
			const val = match[2] || match[3] || match[4] || defaultFilters[key]
			filters.push(`${key}(${val})`)
		}
		if (filters.length === 0) {
			return ''
		}

		this.clearValue()
		return filters.join(' ')
	}

	// Parses fit from a string and returns it as a CSS property
	// It handles cases like cover, contain, none
	parseFit = (): string => {
		let result = ''
		for (const match of this.value.matchAll(regexp.fit)) {
			this.addMatchedList(match.index, match[0].length)
			result = match[0]
		}

		this.clearValue()
		return result
	}

	// Parses axis from a string and returns it as an object
	// It handles cases like w: 100px, h: 200px
	parseDimensions() {
		const dimensions: Record<string, string> = {}
		for (const match of this.value.matchAll(regexp.dimensions)) {
			this.addMatchedList(match.index, match[0].length)

			const key = match[1]
			const val = match[2] || match[3] || match[4]
			dimensions[key] = val
		}

		this.clearValue()
		return dimensions
	}

	// Parses axis from a string and returns it as an object
	// It handles cases like x: 50%, y: 50%
	parseAxis() {
		const axis: Record<string, string> = {}
		for (const match of this.value.matchAll(regexp.axis)) {
			this.addMatchedList(match.index, match[0].length)

			const key = match[1]
			const val = match[2] || match[3] || match[4]
			axis[key] = val
		}

		this.clearValue()
		return axis
	}

	// Parses position key from a string and returns it as a string
	// It handles cases like top, right, bottom, left
	parsePositionKey() {
		let result = ''
		for (const match of this.value.matchAll(regexp.positionKey)) {
			this.addMatchedList(match.index, match[0].length)
			result = match[0]
		}

		this.clearValue()
		return result
	}

	// Parses positions from a string and returns them as an object
	// It handles cases like top: 10px, right: 20px, bottom: 30px, left: 40px
	parsePositions() {
		const positions: Record<string, string> = {}
		for (const match of this.value.matchAll(regexp.position)) {
			this.addMatchedList(match.index, match[0].length)

			const key = match[1]
			const val = match[2] || match[3] || match[4]
			positions[key] = val
		}

		this.clearValue()
		return positions
	}

	// Parses repeat from a string and returns it as a string
	// It handles cases like repeat, no-repeat, repeat-x, repeat-y, space, round
	parseRepeat() {
		let result = ''
		for (const match of this.value.matchAll(regexp.repeatKey)) {
			this.addMatchedList(match.index, match[0].length)
			result = match[0]
		}

		this.clearValue()
		return result
	}

	// Parses repeat axis from a string and returns it as an object
	// It handles cases like repeat-x: repeat, repeat-y: no-repeat
	parseRepeatAxis() {
		const repeatAxis: Record<string, string> = {}
		for (const match of this.value.matchAll(regexp.repeatAxis)) {
			this.addMatchedList(match.index, match[0].length)

			const key = match[1]
			const val = match[2].replace(regexp.quote, '')
			repeatAxis[key] = val
		}

		this.clearValue()
		return repeatAxis
	}

	// Parses a value with unit from a string and returns it as a string
	// It handles cases like 100px, 50%, 1.5em, 2rem
	parseValueWithUnit() {
		let result = ''
		for (const match of this.value.matchAll(regexp.valueWithUnit)) {
			this.addMatchedList(match.index, match[0].length)
			result = match[0]
		}

		this.clearValue()
		return result
	}

	// Parses split directive from a string and returns it as an object
	parseSplit() {
		for (const match of this.value.matchAll(regexp.split)) {
			this.addMatchedList(match.index, match[0].length)
			return match?.[2] || match?.[3] || match?.[4] || ''
		}

		this.clearValue()
		return ''
	}

	// Parses click attributes from a string and returns them as an object
	parseClick() {
		const click: Record<number, string | undefined> = {}
		for (const match of this.value.matchAll(regexp.clickAttributes)) {
			this.addMatchedList(match.index, match[0].length)

			const key = Number(match[1])
			const val = match[2] || match[3] || match[4]
			click[key] = join([click[key], val], ' ')
		}

		this.clearValue()
		return click
	}
}
