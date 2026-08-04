<script lang="ts">
	import { SlideViewer } from '@slidemd/slidemd/components'

	import Slide, { slide } from './example/marp.svelte.md'
</script>

<svelte:head>
	<title>{slide.title}</title>
</svelte:head>
<main class="h-full w-full rounded-sm">
	<SlideViewer slide={Slide} data={slide} />
</main>
