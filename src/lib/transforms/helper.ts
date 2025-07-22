export const regexp = {
	attributes: /([^\s=:]+)[=:](^["'].*?["']$|[^\s]+)/g,
	quote: /^["']|["']$/g,
	class: /\.[^\s]+/g,
	id: /#[^\s]+/g,

	filter: /(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|drop-shadow)(?::\s*(^["'].*?["']$|[^\s]+))?/g,
	size: /cover|contain|none/,
	dimensions: /(w|h):\s*([^\s]+)/g,
	axis: /(x|y):\s*([^\s]+)/g,
	position: /(top|right|bottom|left):\s*([^\s]+)/g,
	percentage: /(\d+)%/
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

// This handles cases where IDs are defined in attributes like #id-name
export const parseId = (value: string): string => {
	return (
		value
			.match(regexp.id)
			?.map((id) => id.slice(1))
			.join(' ') || ''
	)
}

// Extracts class names from a string, ignoring the leading dot.
// This handles cases where class names are defined in attributes like .class-name
export const parseClass = (value: string): string => {
	return (
		value
			.match(regexp.class)
			?.map((className) => className.slice(1))
			.join(' ') || ''
	)
}
