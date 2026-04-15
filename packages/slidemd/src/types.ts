export interface SlideInfo {
	slides: Content[]
	metadata: Record<string, any>
	script: string
	style: string
}

export interface Content extends PageData {
	content: string
}

export interface PageData {
	page: number
	note?: string
	step?: number
}

export interface Options {
	extension?: string
}

export interface SlideProps {
	page: string
}

export interface SlideData {
	title: string
	pages: PageData[]
	markdonw: string
	[key: string]: any
}
