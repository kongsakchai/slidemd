declare module '@slidemd/slides' {
	export const slides: {
		[key: string]: {
			component: import('svelte').Component
			data: import('./types').SlideMD
		}
	}

	export const markdown: string[]
}

declare module '@slidemd/config' {
	export const themes: string[]
}
