/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SlideInfo {
	index: number
	source: string
	class: string
	note: string
}

export interface SlideMarkdown {
	filepath: string
	raw: string
}

export interface SlideMD {
	title: string
	frontmatter?: Record<string, any>
	slides: SlideInfo[]
	markdown: SlideMarkdown
}

export interface SlideMDContext {
	load: () => string[]
	loadMarkdown: (src: string) => SlideMarkdown
	process: (markdown: SlideMarkdown) => Promise<SlideMD>
}
