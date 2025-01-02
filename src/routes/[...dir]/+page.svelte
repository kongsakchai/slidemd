<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import DirectoryItem from '$lib/components/DirectoryItem.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Directory</title>
</svelte:head>

<main class="bg-primary-bg h-full w-full overflow-auto p-6 px-12 text-primary-text">
	<h1>Directory</h1>
	<Breadcrumbs paths={data.path.split('/')} />
	<section class=" flex flex-col gap-2">
		{#each data.detals as detail}
			<DirectoryItem {...detail} />
		{/each}
	</section>
</main>
