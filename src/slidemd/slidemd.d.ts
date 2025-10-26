declare module '@slidemd' {
	export const slides: {
		[key: string]: {
			component: import('svelte').Component
			data: import('./types').SlideMD
		}
	}

	export const markdown: string[]
}
