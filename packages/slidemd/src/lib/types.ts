import type { Directive } from '@slidemd/parse'

// Lib
export interface Options {
	extension?: string
}

// Parser
export type Transformer = (content: string, store: Store, directive: Directive) => string

export interface Content {
	page: number
	step: number
	note?: string
	content: string
	directive: Directive
}

export interface Store {
	paginate: number
	class: string[]
	style: string[]
	footer: string
	header: string
}

// Component
export type SlideMDComponent = import('svelte').Component<SlideProps>

export interface SlideProps {
	page: number
	step: number
}

export interface SlideData {
	title: string
	pages: SlidePageData[]
	[key: string]: Directive[string] | SlidePageData[]
}

export interface SlidePageData {
	page: number
	step: number
	note?: string
}
