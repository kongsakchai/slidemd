<script lang="ts">
	import { slideConfig } from '$lib/states/config.svelte'

	const ASPECT_RATIO: Record<string, number> = {
		'16:9': 16 / 9,
		'4:3': 4 / 3,
		'1:1': 1
	}

	let { children } = $props()

	let bodyWidth = $state(1280)
	let bodyHeight = $state(720)

	let aspect = $derived(ASPECT_RATIO[slideConfig.aspect])
	let scale = $derived.by(() => {
		if (bodyWidth / aspect > bodyHeight) {
			return bodyHeight / (slideConfig.size / aspect)
		}
		return bodyWidth / slideConfig.size
	})
</script>

<svelte:body bind:clientWidth={bodyWidth} bind:clientHeight={bodyHeight} />

<div
	class="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col overflow-auto"
	style:font-size={slideConfig.fontSize + 'px'}
	class:rounded-2xl={slideConfig.scale !== 1}
	style:width="{slideConfig.size}px"
	style:height="{slideConfig.size / aspect}px"
	style:scale={scale * slideConfig.scale}
>
	{@render children()}
</div>
