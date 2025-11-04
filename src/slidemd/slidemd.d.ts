declare module '@slidemd/slides' {
	export type SlideMD = import('./types').SlideMD
	export type SlideInfo = import('./types').SlideInfo
	export type Markdown = import('./types').Markdown

	export interface SlideComponent {
		Slide: import('svelte').Component
		slide: import('./types').SlideMD
	}

	export const slides: {
		[key: string]: () => Promise<SlideComponent>
	}

	export const markdowns: string[]
}

declare module '@slidemd/themes' {
	export const themes: import('./types').Theme[]
}
