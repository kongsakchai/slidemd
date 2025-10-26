/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SlideInfo {
	page: number
	note?: string
	click?: number
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

export interface Context {
	markdowns: () => string[]
	css: () => string[]
	loadMarkdown: (filepath: string) => Markdown
	writeCache: (filepath: string, content: string) => void
	// process: (markdown: Markdown) => Promise<SlideMD>
	extract: (markdown: string) => { body: string; metadata: Record<string, any> }
	parse: (markdown: string, properties: Record<string, any>) => Promise<SlideContentInfo[]>
}
