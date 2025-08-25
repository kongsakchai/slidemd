<script lang="ts">
	import { page } from '$app/state'
	import Files from '$lib/components/files.svelte'
	import Folders from '$lib/components/folders.svelte'

	let { data } = $props()
</script>

<main class="h-full w-full p-6">
	<h1>🚀 Slide MD</h1>
	{#if Object.keys(data.folder.folders).length > 0}
		<Folders folders={Object.entries(data.folder.folders)} current={page.params.folder || ''} />
	{/if}

	{#if data.folder.files.length > 0}
		<Files files={data.folder.files} />
	{/if}
</main>
