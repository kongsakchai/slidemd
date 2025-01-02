<script lang="ts">
	import Folder from '$lib/icons/Folder.svelte';
	import Markdown from '$lib/icons/Markdown.svelte';
	import type { DirectoryItem } from '$lib/types/file';

	let detail: DirectoryItem = $props();
</script>

{#if detail.type === 'dir'}
	<a href={`/${detail.path}`}>
		<Folder />
		<span>{detail.name}</span>
	</a>
{:else}
	<a href={`/file/${detail.path}`}>
		<Markdown />
		<span>{detail.name}</span>
	</a>
{/if}

<style lang="postcss">
	a {
		@apply flex items-center gap-2;
	}
</style>
