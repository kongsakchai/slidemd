// Lib
export interface Options {
	extension?: string
}

export interface PageInfo {
	page: number
	enablePageNumber: boolean
	pageNumber: number
	enableSplit: boolean
	backgroundStyle: string
	split: string
	class: string
	style: string
	layout: string
	content: string
}

// Component
export type SlideComponent = import('svelte').Component<SlideProps>

export interface SlideProps {
	page: number
	step: number
}

// Slide
export interface SlideData {
	title: string
	pages: PageData[]
	[key: string]: unknown
}

export interface PageData {
	step?: number
	note?: string
}
