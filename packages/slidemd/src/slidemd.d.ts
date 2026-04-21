declare module '*.md' {
	import type { SlideData, SlideMDComponent } from '@lib/types'

	export const slide: SlideData

	const Component: SlideMDComponent
	export default Component
}
