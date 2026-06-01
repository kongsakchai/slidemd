import type { Directive } from '@slidemd/parse'
import type { Store } from '@slidemd/slidemd/types'

type BackgroundKey = 'bg' | 'bg-color' | 'bg-image' | 'bg-size' | 'bg-position' | 'bg-opacity'

const BACKGROUND_LIST: BackgroundKey[] = ['bg', 'bg-color', 'bg-image', 'bg-size', 'bg-position', 'bg-opacity']

const BACKGROUND_MAP_STYLE: Record<BackgroundKey, string> = {
	bg: 'background',
	'bg-color': 'background-color',
	'bg-image': 'background-image',
	'bg-size': 'background-size',
	'bg-position': 'background-position',
	'bg-opacity': 'opacity'
}

export function buildBackgroundStyle(directive: Directive): string {
	return BACKGROUND_LIST.filter((key) => typeof directive[key] === 'string')
		.map((key) => `${BACKGROUND_MAP_STYLE[key]}: ${directive[key] as string}`)
		.join(';')
}

export function backgroundTransformer(content: string, _: Store, directive: Directive): string {
	const style = buildBackgroundStyle(directive)
	return style ? `<div class='slide-background' style='${style}'></div>\n${content}` : content
}
