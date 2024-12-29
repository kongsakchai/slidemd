<script lang="ts">
	import '$lib/components';
	import mermaid from 'mermaid';

	let { data } = $props();

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

{#each data.pages as page}
	<section>{@html page}</section>
{/each}
