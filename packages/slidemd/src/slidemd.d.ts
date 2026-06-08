declare module '*.md' {
	import type { SlideComponent, SlideData } from '@slidemd/slidemd/types'

	export const slide: SlideData

	const Component: SlideComponent
	export default Component
}
