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
	<a href="/">Home</a>
	{#each paths as path, i}
		<span>/</span>
		<a href={getPaths(i)}>{path}</a>
	{/each}
</div>
