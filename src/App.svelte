<script lang="ts">
	import SlideComponent from '@/lib/components/SlideComponent.svelte';

	const fetchMarkdown = async () => {
		const res = await fetch('/markdown.md');
		if (!res.ok) {
			throw new Error(`Failed to fetch markdown: ${res.statusText}`);
		}

		return await res.text();
	};
</script>

{#await fetchMarkdown()}
	<p>Loading</p>
{:then markdown}
	<SlideComponent {markdown} />
{:catch error}
	<p>{error.message}</p>
{/await}
