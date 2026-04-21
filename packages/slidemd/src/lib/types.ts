// Lib
export interface Options {
	extension?: string
}

// Parser
export interface SlideInfo {
	slides: Content[]
	metadata: Record<string, any>
	script: string
	style: string
}

export interface Content extends PageData {
	content: string
}

// Export
export type SlideMDComponent = import('svelte').Component<SlideProps>

export interface SlideProps {
	page: number
}

export interface SlideData {
	title: string
	pages: PageData[]
	markdown: string
	[key: string]: any
}

export interface PageData {
	page: number
	note?: string
	step?: number
}
