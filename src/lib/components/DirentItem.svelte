<script lang="ts">
	import Folder from '$lib/icons/Folder.svelte';
	import Markdown from '$lib/icons/Markdown.svelte';
	import type { DirectoryItem } from '$lib/types';

	let { type, name, path }: DirectoryItem = $props();
</script>

{#if type === 'dir'}
	<a href={path} class="flex items-center gap-2">
		<Folder />
		<span>{name}</span>
	</a>
{:else}
	<a href={path} class="flex items-center gap-2">
		<Markdown />
		<span>{name}</span>
	</a>
{/if}
