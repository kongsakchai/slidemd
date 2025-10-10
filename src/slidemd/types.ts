/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SlideInfo {
	index: number
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
	load: () => string[]
	loadMarkdown: (filepath: string) => Markdown
	// process: (markdown: Markdown) => Promise<SlideMD>
	extract: (markdown: string) => { body: string; metadata: Record<string, any> }
	parse: (markdown: string, properties: Record<string, any>) => Promise<SlideContentInfo[]>
}
