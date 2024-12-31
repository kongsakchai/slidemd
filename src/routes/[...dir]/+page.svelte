<script lang="ts">
	import Folder from '$lib/icons/Folder.svelte';
	import Markdown from '$lib/icons/Markdown.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Directory</title>
</svelte:head>

<main class="h-full w-full bg-white p-6 px-12">
	<h1>Directory</h1>
	<section class=" flex flex-col gap-2">
		{#each data.detals as detals}
			{#if detals.type === 'dir'}
				<a href={detals.path}>
					<Folder />
					<span>{detals.name}</span>
				</a>
			{:else}
				<a href={'/file/' + detals.path}>
					<Markdown />
					<span>{detals.name}</span>
				</a>
			{/if}
		{/each}
	</section>
</main>

<style lang="postcss">
	a {
		@apply flex items-center gap-2;
	}
</style>
