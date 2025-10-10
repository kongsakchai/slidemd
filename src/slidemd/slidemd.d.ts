declare module '@slidemd' {
	export interface Module {
		slides: {
			[key: string]: {
				component: import('svelte').Component
				data: import('$lib/slidemd/types').Slide
			}
		}
		markdowns: string[]
	}

	const module: Module
	export default module
}
