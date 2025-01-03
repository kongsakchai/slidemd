<script lang="ts">
	import Controller from '$lib/components/Controller.svelte';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import { initCodeCopyButton } from '$lib/service/codeblock';
	import { initMermaid } from '$lib/service/mermaid';
	import { currentPage } from '$lib/service/page';
	import { slideStore } from '$lib/store/slide.svelte';

	let { data } = $props();

	$effect(() => {
		slideStore.initPage(currentPage(), data.count);
		initMermaid().then(() => slideStore.setReady(true));
	});

	$effect(() => {
		const destroy = initCodeCopyButton();
		return () => {
			destroy();
		};
	});
</script>

<svelte:head>
	<title>{data.meta.title}</title>
</svelte:head>

<main class="relative">
	<ThemeSwitch />
	{#each data.pages as pageData, i}
		<svg viewBox="0 0 1280 720" class:hidden={slideStore.ready && i + 1 != slideStore.page}>
			<foreignObject width="1280" height="720">
				<section class="slide">{@html pageData}</section>
			</foreignObject>
		</svg>
	{/each}
</main>

<Controller />
