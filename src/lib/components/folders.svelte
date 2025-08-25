<script lang="ts">
	import type { Folder } from '$lib/server/content'

	interface Props {
		current: string
		folders: [key: string, value: Folder][]
	}

	let { current, folders }: Props = $props()

	const join = (path: string) => {
		if (!current) return '/' + path

		return `/${current}/${path}`
	}
</script>

<p class=""><b>Folders</b></p>
<section class="grid grid-cols-6 gap-6">
	{#each folders as [key]}
		<a
			href={join(key)}
			class="bg-primary-foreground/10 hover:bg-primary-hover text-primary-foreground flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-medium"
		>
			<div class="folder-icon h-8 w-8"></div>
			{key}
		</a>
	{/each}
</section>

<style>
	.folder-icon {
		background-color: var(--primary-foreground-2);
		mask: url('../icons/folder-icon.svg') no-repeat center;
	}
</style>
