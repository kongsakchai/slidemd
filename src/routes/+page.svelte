<script lang="ts">
	import Controller from '$lib/components/Controller.svelte';
	import { initMermaid } from '$lib/service/mermaid.js';
	import { slideStore } from '$lib/store/slide.svelte.js';

	let { data } = $props();

	slideStore.setPageCount(data.pages.length);
	$effect(() => {
		initMermaid().then(() => slideStore.setReady(true));
	});

	$inspect(slideStore.ready);
</script>

<svelte:head>
	<title>{data.meta.title}</title>
</svelte:head>

{#each data.pages as pageData, i}
	<svg viewBox="0 0 1280 720" class:hidden={slideStore.ready && i + 1 != slideStore.page}>
		<foreignObject width="1280" height="720">
			<section>{@html pageData}</section>
		</foreignObject>
	</svg>
{/each}

<Controller />
