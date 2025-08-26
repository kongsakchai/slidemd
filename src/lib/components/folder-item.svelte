<script lang="ts">
	interface Props {
		name: string
		link: string
	}

	let { name, link }: Props = $props()
</script>

<a
	href="/{link}"
	class="bg-primary-foreground/10 hover:bg-primary-hover text-primary-foreground flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-medium"
>
	<div class="folder-icon h-8 w-8"></div>
	<p class="my-0 flex-1 truncate">{name}</p>
</a>

<style>
	.folder-icon {
		background-color: var(--primary-foreground-2);
		mask: url('../icons/folder-icon.svg') no-repeat center;
	}
</style>
