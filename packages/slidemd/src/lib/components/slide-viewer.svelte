<script lang="ts">
	import { createSlideContext, createViewContext } from '@slidemd/slidemd/state'
	import type { SlideComponent, SlideData } from '@slidemd/slidemd/types'

	import Container from './container.svelte'
	import Controller from './controller.svelte'
	import StepProgress from './step-progress.svelte'
	import ZoomLayout from './zoom-layout.svelte'

	interface Props {
		data: SlideData
		slide: SlideComponent
		width?: number
		height?: number
	}

	const { data, slide: Slide, width = 1280, height = 720 }: Props = $props()

	// svelte-ignore state_referenced_locally
	const viewContext = createViewContext({ width, height })
	// svelte-ignore state_referenced_locally
	const slideCtx = createSlideContext(data)

	$effect(() => {
		viewContext.width = width
		viewContext.height = height
	})
</script>

<Container>
	<ZoomLayout>
		<!-- Slide -->
		<Slide bind:page={slideCtx.page} bind:step={slideCtx.step} />
	</ZoomLayout>

	<StepProgress />

	{#snippet overlay()}
		<Controller />
	{/snippet}
</Container>
