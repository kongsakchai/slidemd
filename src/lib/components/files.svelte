<script lang="ts">
	import type { File } from '$lib/server/content'

	interface Props {
		files: File[]
	}

	let { files }: Props = $props()
</script>

<p class=""><b>Files</b></p>
<section class="grid grid-cols-6 gap-6">
	{#each files as item}
		<a href="view/{item.path}" class="flex items-center gap-2">
			<div class="file-icon h-8 w-8"></div>
			<p class="my-0 flex-1 truncate">{item.name}</p>
		</a>
	{/each}
</section>

<style>
	.file-icon {
		background-color: var(--action);
		mask: url('../icons/markdown-icon.svg') no-repeat center;
	}
</style>
