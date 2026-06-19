import type { Directive } from '@slidemd/parser'

export function buildSplitValue(val: Directive[string]) {
	if (typeof val === 'number') {
		return `--split-cols: repeat(${val},1fr)`
	}
	if (typeof val === 'object' && Array.isArray(val)) {
		const normalize = val.map((v) => {
			return typeof v === 'number' ? `${v}fr` : (v as string)
		})
		return `--split-cols: ${normalize.join(' ')}`
	}
	return `--split-cols: ${val as string}`
}

export function splitLayoutTransformer(content: string, directive: Directive) {
	if (!directive['split-cols'] && !directive['split-rows']) return content

	const styles: string[] = []
	if (directive['split-cols']) {
		styles.push(buildSplitValue(directive['split-cols']))
	}
	if (directive['split-rows']) {
		styles.push(buildSplitValue(directive['split-rows']))
	}
	if (typeof directive['split-gap'] === 'string') {
		styles.push(`--split-gap: ${directive['split-gap']}`)
	}

	return `<div class="split" style="${styles.join(';')}">${content}</div>`
}
