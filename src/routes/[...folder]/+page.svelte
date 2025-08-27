<script lang="ts">
	import { page } from '$app/state'
	import FileItem from '$lib/components/file-item.svelte'
	import FolderItem from '$lib/components/folder-item.svelte'
	import Folders from '$lib/components/folder.svelte'
	import type { File, Folder } from '$lib/types'

	let { data } = $props()

	const folder = $derived.by(() => {
		const pathSplit = page.params.folder?.split('/') || []
		let folder = data.contentList as Folder

		for (let i = 0; i < pathSplit.length; i++) {
			const key = pathSplit[i]
			if (!key) continue

			if (!folder.folders[key]) {
				return null
			}

			folder = folder.folders[key]
		}
		return folder
	})
</script>

<main class="h-full w-full p-6">
	<h1>🚀 Slide MD</h1>
	{#if folder && Object.keys(folder.folders).length > 0}
		<Folders list={Object.entries(folder.folders)} title="Folders">
			{#snippet render([name, folder]: [string, Folder])}
				<FolderItem {name} link={folder.path} />
			{/snippet}
		</Folders>
	{/if}

	{#if folder && folder.files.length > 0}
		<Folders list={folder.files} title="Files">
			{#snippet render(file: File)}
				<FileItem name={file.name} link={file.path} />
			{/snippet}
		</Folders>
	{/if}

	{#if !folder}
		<section class="flex h-1/2 w-full flex-col items-center justify-center">
			<h1>PAGE NOT FOUND 🥲</h1>
			<a href="/">Back</a>
		</section>
	{/if}
</main>
