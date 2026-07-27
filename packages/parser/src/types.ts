export type Attribute = Record<string, string | number | boolean | (string | number)[] | null | undefined>

export type Directive = Record<string, unknown>

export interface SlideData {
	global?: Directive
	local?: Directive
	title?: string
}

export interface SlideContext {
	slides: (SlideData & { breakIndex: number })[]
	style: string[]
	script: string[]
	extra: Directive
}

export interface SlideInfo extends SlideData {
	index: number
	content: string
}

export interface SlideResult {
	slides: SlideInfo[]
	style: string[]
	script: string[]
	extra: Directive
}
