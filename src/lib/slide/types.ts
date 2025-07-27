export interface BackgroundProperties {
	bgImg?: string
	bgColor?: string
	bgSize?: string
	bgPosition?: string
	bgRepeat?: string
}

export interface PageProperties {
	paging?: boolean | 'skip' | 'hold'
	class?: string
	style?: string
	color?: string
}

export interface PageSplitProperties {
	split?: boolean
	splitDir?: 'horizontal' | 'vertical'
	splitSize?: string
}

export interface SlideProperties extends BackgroundProperties, PageProperties {
	title?: string
}

export type Directive = BackgroundProperties & PageProperties & PageSplitProperties

export type DirectiveKey = Extract<keyof Directive, string>

export interface Slide {
	properties: SlideProperties
	pages: SlidePage[]
}

export interface SlidePage {
	html: string
	directive: Directive
}
