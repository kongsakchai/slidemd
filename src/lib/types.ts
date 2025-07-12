export interface BackgroundProperties {
	backgroundImg?: string
	backgroundColor?: string
	backgroundSize?: string
	backgroundPosition?: string
	backgroundRepeat?: string
}

export interface TransitionProperties {
	in?: string
	out?: string
	transition?: string
	transitionDuration?: number
	transitionTimingFunction?: string
}

export interface PageProperties {
	paging?: boolean | 'skip' | 'hold'
	class?: string
	style?: string
	color?: string
}

export interface SlideProperties
	extends BackgroundProperties,
		TransitionProperties,
		PageProperties {
	title?: string
}

export type Directive = BackgroundProperties & TransitionProperties & PageProperties

export type DirectiveKey = Extract<keyof Directive, string>
