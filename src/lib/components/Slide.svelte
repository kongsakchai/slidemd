<script lang="ts">
	import { initMermaid } from '$lib/service/mermaid';
	import type { Slide } from '$lib/service/slide';
	import { slideStore } from '$lib/store/slide.svelte.ts';
	import Controller from './Controller.svelte';

	interface Props {
		slide: Slide;
	}

	const { slide }: Props = $props();
	slideStore.setPageCount(slide.pages.length);

	$effect(() => {
		initMermaid().then(() => slideStore.setReady(true));
	});
</script>

<svelte:head>
	<title>{slide.meta.title}</title>
</svelte:head>

{#each slide.pages as pageData, i}
	<svg viewBox="0 0 1280 720" class:hidden={slideStore.ready && i + 1 != slideStore.page}>
		<foreignObject width="1280" height="720">
			<section class="slide">{@html pageData}</section>
		</foreignObject>
	</svg>
{/each}

<Controller />
