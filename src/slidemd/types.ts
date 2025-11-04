/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SlideInfo {
	page: number
	note?: string
	step?: number
}

export interface SlideContentInfo extends SlideInfo {
	content: string
}

export interface Markdown {
	filepath: string
	raw: string
}

export interface SlideMD {
	title: string
	frontmatter?: Record<string, any>
	slides: SlideInfo[]
	markdown: Markdown
}

export interface Theme {
	name: string
	builtin?: boolean
}

export interface Context {
	markdowns?: string[]
	css?: string[]
	builtinCSS: string[]
}
