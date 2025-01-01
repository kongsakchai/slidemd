<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import PathItem from '$lib/components/PathItem.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Directory</title>
</svelte:head>

<main class="h-full w-full overflow-auto bg-white p-6 px-12">
	<h1>Directory</h1>
	<Breadcrumbs paths={data.path.split('/')} />
	<section class=" flex flex-col gap-2">
		{#each data.detals as detail}
			<PathItem {...detail} />
		{/each}
	</section>
</main>
