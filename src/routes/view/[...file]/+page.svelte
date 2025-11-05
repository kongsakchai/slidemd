<script lang="ts">
	import SlideShow from '$lib/slide/slide-show.svelte'

	import { slides } from '@slidemd/slides'

	let { data } = $props()
</script>

<main class="relative h-full w-screen overflow-hidden bg-black touch-none">
	{#await slides[data.file]() then slide}
		<SlideShow Slide={slide.Slide} slide={slide.slide} />
	{/await}
</main>
