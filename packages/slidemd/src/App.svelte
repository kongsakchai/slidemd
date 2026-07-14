<script lang="ts">
	import Slide, { slide } from './example/marp.svelte.md'
	import SlideViewer from './lib/components/slide-viewer.svelte'
</script>

<main class="h-full w-full rounded-sm">
	<SlideViewer slide={Slide} data={slide} />
</main>
