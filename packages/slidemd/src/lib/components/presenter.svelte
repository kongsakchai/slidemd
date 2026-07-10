<script lang="ts">
	import { SlideState } from '../state/slide.svelte'
	import type { SlideComponent, SlideData } from '../types'
	import Controller from './controller.svelte'
	import Layout from './layout.svelte'
	import ZoomLayout from './zoom-layout.svelte'

	interface Props {
		data: SlideData
		slide: SlideComponent
		width?: number
		height?: number
	}

	const { data, slide: Slide, width = 1280, height = 720 }: Props = $props()

	const slideState = $derived(new SlideState(data))
</script>

<Layout {slideState} {width} {height}>
	<ZoomLayout {slideState}>
		<Slide bind:page={slideState.page} bind:step={slideState.step} />
	</ZoomLayout>

	{#snippet overlay()}
		<Controller {slideState} />
	{/snippet}
</Layout>
