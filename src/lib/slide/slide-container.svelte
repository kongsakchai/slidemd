<script lang="ts">
	import { panzoom } from '$lib/actions/pan.svelte'
	import { slideConfig } from '$lib/states/config.svelte'

	const ASPECT_RATIO: Record<string, number> = {
		'16:9': 16 / 9,
		'4:3': 4 / 3,
		'1:1': 1
	}

	let { children, zoom = 100 } = $props()

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
	class="absolute top-1/2 left-1/2 flex -translate-1/2 overflow-hidden"
	style:font-size={slideConfig.fontSize + 'px'}
	class:rounded-2xl={slideConfig.scale !== 100}
	style:width="{slideConfig.size}px"
	style:height="{slideConfig.size / aspect}px"
	style:scale={(scale * slideConfig.scale) / 100}
>
	<div class="w-full h-full overflow-scroll bg-background" style:scale={zoom / 100} use:panzoom={() => zoom / 100}>
		{@render children()}
	</div>
</div>
