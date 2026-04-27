<script lang="ts">
	import { SlideController, SlideLayout } from '@lib/components'
	import { PageState } from '@lib/utils'

	import Slide, { slide } from './example/marp.md'

	const state = new PageState(slide)
</script>

<main class="h-full w-full">
	<SlideLayout>
		<Slide bind:page={state.page} bind:step={state.step} />

		{#snippet controller()}
			<SlideController {state} />
		{/snippet}
	</SlideLayout>
</main>
