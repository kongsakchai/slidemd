declare module '*.md' {
	import type { SlideComponent, SlideData } from '@decko/decko/types'

	export const slide: SlideData

	const Component: SlideComponent
	export default Component
}
