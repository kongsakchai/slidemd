export type Attribute = Record<string, string | number | boolean | (string | number)[] | null | undefined>

export type Directive = Record<string, unknown>

export interface SlideInfo {
	index: number
	content: string
	global: Directive
	local: Directive

	title?: string
	note?: string
	step?: number
}

export interface SlideParsed {
	slides: SlideInfo[]
	style?: string
	script?: string
}
