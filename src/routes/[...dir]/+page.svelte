<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import DirectoryItem from '$lib/components/DirectoryItem.svelte';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Directory</title>
</svelte:head>

<main class="h-full w-full overflow-auto bg-primary-bg p-6 px-12 text-primary-text">
	<h1>Directory</h1>
	<Breadcrumbs paths={data.path.split('/')} />
	<section class=" flex flex-col gap-2">
		{#each data.detals as detail}
			<DirectoryItem {...detail} />
		{/each}
	</section>
	<ThemeSwitch />
</main>
