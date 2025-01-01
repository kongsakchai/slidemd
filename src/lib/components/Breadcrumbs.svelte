<script lang="ts">
	interface Props {
		paths: string[];
	}

	let { paths } = $props();

	const getPaths = (index: number) => {
		let path = paths.slice(0, index + 1).join('/');
		return `/${path}`;
	};
</script>

<div class="my-4 flex gap-2 text-sm">
	<a class="text-primary-text underline" href="/">Home</a>
	{#each paths as path, i}
		{#if path}
			<span>></span>
		{/if}
		<a class="text-primary-text underline" href={getPaths(i)}>{path}</a>
	{/each}
</div>
