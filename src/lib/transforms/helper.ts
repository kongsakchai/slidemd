// Extracts IDs from a string, ignoring the leading hash.

import { regexp } from './regexp'

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
