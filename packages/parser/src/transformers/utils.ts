const ATTR_REGEX = /([.#a-zA-Z][\w-@:]+)(?:=(["'])(.*?)\2|=({.*?})|=([^\s]*))?/g

export const extractAttributes = (str?: string | null): Record<string, string> => {
	if (!str) return {}

	const attrs: Record<string, string> = {}
	const ids: string[] = []
	const className: string[] = []

	for (const match of str.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[3] || match[4] || match[5] || ''

		if (key === 'class') {
			className.push(value)
		} else if (key === 'id') {
			ids.push(value)
		} else if (key.startsWith('.')) {
			className.push(key.slice(1) + value)
		} else if (key.startsWith('#')) {
			ids.push(key.slice(1) + value)
		} else {
			attrs[key] = value
		}
	}
	if (className.length > 0) {
		attrs['class'] = className.join(' ').trim()
	}
	if (ids.length > 0) {
		attrs['id'] = ids.join(' ').trim()
	}

	return attrs
}
