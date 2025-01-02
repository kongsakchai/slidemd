<script lang="ts">
	import Controller from '$lib/components/Controller.svelte';
	import { initMermaid } from '$lib/service/mermaid';
	import { currentPage } from '$lib/service/page.js';
	import { slideStore } from '$lib/store/slide.svelte';

	let { data } = $props();

	$effect(() => {
		slideStore.initPage(currentPage(), data.count);
		initMermaid().then(() => slideStore.setReady(true));
	});

	$effect(() => {
		const copy = (e: Event) => {
			if (!e.target) return;
			const btn = e.target as HTMLElement;
			const code = btn.parentElement?.querySelector('pre');
			if (!code || !code.textContent) return;

			navigator.clipboard.writeText(code.textContent);
			btn.textContent = 'Copied!';
			setTimeout(() => {
				btn.textContent = 'Copy';
			}, 2000);
		};

		const copyCodeBtn = document.querySelectorAll('button.copy-code');
		copyCodeBtn.forEach((btn) => {
			btn.addEventListener('click', copy);
		});

		return () => {
			copyCodeBtn.forEach((btn) => {
				btn.removeEventListener('click', copy);
			});
		};
	});
</script>

<svelte:head>
	<title>{data.meta.title}</title>
</svelte:head>

{#each data.pages as pageData, i}
	<svg viewBox="0 0 1280 720" class:hidden={slideStore.ready && i + 1 != slideStore.page}>
		<foreignObject width="1280" height="720">
			<section class="slide">{@html pageData}</section>
		</foreignObject>
	</svg>
{/each}

<Controller />
