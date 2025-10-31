declare module '@slidemd/slides' {
	export const slides: {
		[key: string]: {
			component: import('svelte').Component
			data: import('./types').SlideMD
		}
	}

	export const markdowns: string[]
}

declare module '@slidemd/config' {
	export const themes: import('./types').Theme[]
}
