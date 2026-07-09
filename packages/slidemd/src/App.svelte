<script lang="ts">
	import Slide, { slide } from './example/marp.svelte.md'
	import { Presenter } from './lib/components'
</script>

<main class="h-full w-full">
	<Presenter slide={Slide} data={slide} />
</main>
