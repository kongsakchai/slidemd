<script lang="ts">
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import DirectoryItem from '$lib/components/dirent-item.svelte';
	import ThemeSwitch from '$lib/components/theme-switch.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Directory</title>
</svelte:head>

<main class="bg-primary text-primary-text h-full w-full overflow-auto p-6 px-12">
	<h1>Directory</h1>
	<Breadcrumbs paths={data.path.split('/')} />
	<section class=" flex flex-col gap-2">
		{#each data.list as item}
			<DirectoryItem {...item} />
		{/each}
	</section>
	<ThemeSwitch />
</main>
