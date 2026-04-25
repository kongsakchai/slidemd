<script lang="ts">
	import { SlideController, SlideLayout } from '@lib/components'

	import Slide, { slide } from './example/marp.md'

	let page = $state(1)
	let step = $state(1)
</script>

<main class="h-full w-full">
	<SlideLayout>
		<Slide bind:page bind:step />

		{#snippet controller()}
			<SlideController bind:page bind:step {slide} />
		{/snippet}
	</SlideLayout>
</main>
