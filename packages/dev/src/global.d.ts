declare module '*.md' {
	import type { SlideData, SlideProps } from '@slidemd/slidemd'

	export const slide: SlideData

	const Component: import('svelte').Component<SlideProps>
	export default Component
}
