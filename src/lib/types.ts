export interface Folder {
	folders: Record<string, Folder>
	files: File[]
	path: string
}

export interface File {
	name: string
	path: string
}

export interface StepNode {
	node: HTMLElement
	previous: string[]
}

export interface SlideConfig {
	theme: string
	aspect: string
	scale: number
	fontSize: number
	size: number
	dark: boolean
}

export interface SlideController {
	page: number
	maxPage: number
	fullscreen: boolean

	onnext?: () => void
	onprevious?: () => void
	onfullscreen?: () => void
}
