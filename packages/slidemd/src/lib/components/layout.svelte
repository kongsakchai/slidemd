<script lang="ts">
	import { SlideState } from '@slidemd/slidemd/state/slide.svelte'

	import type { Snippet } from 'svelte'

	interface Props {
		width: number
		height: number
		overlay?: Snippet
		children: Snippet
		slideState: SlideState
	}

	let { width, height, children, overlay, slideState }: Props = $props()

	let layoutWidth = $state(0)
	let layoutHeight = $state(0)
	let slideSize = $derived.by(() => {
		const aspect = width / height
		const tempHeight = layoutWidth / aspect
		const isOverHeight = tempHeight > layoutHeight
		const finalWidth = isOverHeight ? layoutHeight * aspect : layoutWidth

		return finalWidth / width
	})
</script>

<section
	id="slide-layout"
	class="relative h-full w-full content-center overflow-hidden bg-black"
	bind:clientWidth={layoutWidth}
	bind:clientHeight={layoutHeight}
>
	<section
		id="slide-container"
		class="absolute top-1/2 left-1/2 flex overflow-hidden select-none"
		class:rounded-xl={slideState.scale < 1}
		style:font-size={slideState.fontSize + 'px'}
		style:width="{width}px"
		style:height="{height}px"
		style:translate="-50% -50%"
		style:scale={slideSize * slideState.scale}
	>
		{@render children()}
	</section>

	{@render overlay?.()}
</section>

<style lang="postcss">
	#slide-container {
		transform: translate(-50%, -50%) scale(var(--slide-scale));
	}
</style>
