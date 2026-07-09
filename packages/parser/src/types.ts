export type Attribute = Record<string, string | number | boolean | (string | number)[] | null | undefined>

export type Directive = Record<string, unknown>

export interface SlideData {
	global?: Directive
	local?: Directive
	title?: string
	note?: string
	step?: number
}

export interface SlideContext {
	slides: (SlideData & { breakIndex: number })[]
	style: string[]
	script: string[]
	codeLanguage: Set<string>
}

export interface SlideInfo extends SlideData {
	index: number
	content: string
}

export interface SlideResult {
	slides: SlideInfo[]
	style: string[]
	script: string[]
	codeLanguage: string[]
}
