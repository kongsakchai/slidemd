<script lang="ts">
	import { page } from '$app/state';
	import Controller from '$lib/components/Controller.svelte';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import { initCodeCopyButton } from '$lib/services/codeblock';
	import { initMermaid } from '$lib/services/mermaid';
	import { clamp, hashToNumber } from '$lib/utils/number';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let ready = $state(false);

	let currentPage = $derived.by(() => {
		const c = hashToNumber(page.url.hash);
		return clamp(c, 1, data.count);
	});

	$effect(() => {
		initMermaid().then(() => (ready = true));
		const destroy = initCodeCopyButton();
		return () => {
			destroy();
		};
	});
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
</svelte:head>

<main class="relative">
	<ThemeSwitch />
	<svg viewBox="0 0 1280 720">
		<foreignObject width="1280" height="720">
			{#each data.slide as pageData, i}
				<section
					in:fade={{ duration: 300 }}
					out:fade={{ duration: 300 }}
					class="slide"
					class:hidden={ready && i + 1 != currentPage}
				>
					{@html pageData}
				</section>
			{/each}
		</foreignObject>
	</svg>
</main>

<Controller current={currentPage} count={data.count} />
