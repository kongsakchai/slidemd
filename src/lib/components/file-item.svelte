<script lang="ts">
	interface Props {
		name: string
		link: string
	}

	let { name, link }: Props = $props()
</script>

<a href={link} class="flex items-center gap-2">
	<div class="file-icon h-8 w-8"></div>
	<p class="my-0 flex-1 truncate">{name}</p>
</a>

<style>
	.file-icon {
		background-color: var(--action);
		mask: url('../icons/markdown-icon.svg') no-repeat center;
	}
</style>
