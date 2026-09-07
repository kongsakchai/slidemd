<script lang="ts">
	import { useURLState } from '@slidemd/slidemd/client/url.svelte'
	import { createSlideContext, createViewContext } from '@slidemd/slidemd/state'
	import type { SlideComponent, SlideData } from '@slidemd/slidemd/types'

	import { untrack } from 'svelte'

	import Container from './container.svelte'
	import NavigationBar from './navigation-bar.svelte'
	import StepProgress from './step-progress.svelte'
	import ZoomLayout from './zoom-layout.svelte'

	interface Props {
		data: SlideData
		slide: SlideComponent
		width?: number
		height?: number
	}

	const { data, slide: Slide, width = 1280, height = 720 }: Props = $props()

	const slideCtx = createSlideContext(untrack(() => data))

	const viewCtx = createViewContext(untrack(() => ({ width, height })))

	useURLState()

	$effect(() => {
		slideCtx.slide = data
	})

	$effect(() => {
		viewCtx.width = width
		viewCtx.height = height
	})
</script>

<Container>
	<ZoomLayout>
		<Slide bind:page={slideCtx.page} bind:step={slideCtx.step} />
	</ZoomLayout>

	<StepProgress />

	{#snippet outside()}
		<NavigationBar />
	{/snippet}
</Container>
