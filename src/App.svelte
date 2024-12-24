<script lang="ts">
	import { type Slide, createRenderer } from '@/lib/slides';

	let slide = $state<Slide>();
	let render = createRenderer();

	$effect(() => {
		const fetchMarkdown = async () => {
			const res = await fetch('/markdown.md');
			const text = await res.text();
			slide = render(text);
		};

		fetchMarkdown();
	});
</script>

{#each slide?.htmls! as html, i}
	<svg viewBox="0 0 1280 720">
		<foreignObject width="1280" height="720">
			<section>{@html html}</section>
		</foreignObject>
	</svg>
{:else}
	<p>Loading</p>
{/each}
