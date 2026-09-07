<script lang="ts">
	import { useViewContext } from '@slidemd/slidemd/state'

	import type { Snippet } from 'svelte'

	interface Props {
		outside?: Snippet
		children: Snippet
	}

	let { children, outside }: Props = $props()

	const viewContext = useViewContext()
</script>

<section
	class="relative h-full w-full content-center overflow-hidden bg-black"
	bind:clientWidth={viewContext.viewportWidth}
	bind:clientHeight={viewContext.viewportHeight}
>
	<section
		id="slide-container"
		class="bg-background absolute top-1/2 left-1/2 flex overflow-hidden select-none"
		class:rounded-xl={viewContext.size < 1}
		style:font-size="{viewContext.fontSize}px"
		style:width="{viewContext.width}px"
		style:height="{viewContext.height}px"
		style:translate="-50% -50%"
		style:scale={viewContext.scale}
	>
		{@render children()}
	</section>

	{@render outside?.()}
</section>

<style lang="postcss">
	#slide-container {
		transform: translate(-50%, -50%) scale(var(--slide-scale));
	}
</style>
