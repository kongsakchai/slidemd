// See https://svelte.dev/docs/kit/types#app.d.ts

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'virtual:slidemd*' {
	export interface SlideData {
		[key: string]: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			component: any
			data: import('$lib/slidemd/types').Slide
		}
	}

	const a: SlideData
	export default a
}
