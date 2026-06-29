import { type Directive } from '@slidemd/parser'

const BACKGROUND_PROPS = {
	bg: 'background',
	'bg-color': 'background-color',
	'bg-image': 'background-image',
	'bg-size': 'background-size',
	'bg-position': 'background-position',
	'bg-opacity': 'opacity',
	'bg-filter': 'filter'
} as const satisfies Record<string, string>

type BackgroundKey = keyof typeof BACKGROUND_PROPS

export function toBackgroundStyles(directive: Directive): string {
	return (Object.entries(BACKGROUND_PROPS) as [BackgroundKey, string][])
		.filter(([key]) => typeof directive[key] === 'string')
		.map(([key, prop]) => `${prop}: ${directive[key] as string}`)
		.join(';')
}

function toSplitValue(value: string): string {
	const parts = value.trim().split(/\s+/).filter(Boolean)

	if (parts.length === 1 && /^\d+$/.test(parts[0])) {
		return `repeat(${parts[0]},1fr)`
	}

	return parts.map((p) => (/^\d+$/.test(p) ? `${p}fr` : p)).join(' ')
}

export function toSplitStyles(directive: Directive): string | undefined {
	const split = directive.split

	if (typeof split === 'number') {
		return `style="--split-col: repeat(${split},1fr)"`
	}

	if (typeof split === 'string') {
		const [colRaw, rowRaw] = split.split(',')

		const colStyle = colRaw?.trim() ? `--split-col: ${toSplitValue(colRaw)}` : ''
		const rowStyle = rowRaw?.trim() ? `--split-row: ${toSplitValue(rowRaw)}` : ''

		const styles = [colStyle, rowStyle].filter(Boolean).join('; ')
		return styles ? `style="${styles}"` : undefined
	}

	return undefined
}

export function resolvePaginate(paginate: unknown, current: number) {
	return {
		show: paginate === true || paginate === 'hold',
		current: paginate !== 'skip' && paginate !== 'hold' ? current + 1 : current
	}
}
