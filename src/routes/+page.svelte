<script lang="ts">
	import Controller from '$lib/components/Controller.svelte';
	import mermaid from 'mermaid';

	let { data } = $props();
	let page = $state(1);

	$effect(() => {
		mermaid.initialize({
			startOnLoad: true,
			fontSize: 12,
			fontFamily: 'Geist Mono, Sarabun',
			htmlLabels: true
		});

		mermaid.run({ querySelector: '.mermaid' });
	});
</script>

<svelte:head>
	<title>{data.meta.title}</title>
</svelte:head>

{#each data.pages as pageData, i}
	<section class:hidden={i + 1 != page}>{@html pageData}</section>
{/each}

<Controller bind:page pageCount={data.pages.length} />
