<script lang="ts">
	import { SlidePlayer } from '@decko/decko/components'

	import Slide, { slide } from './example/svelte-101.svelte.md'
</script>

<svelte:head>
	<title>{slide.title}</title>
</svelte:head>
<main class="h-full w-full rounded-sm">
	<SlidePlayer slide={Slide} data={slide} />
</main>
