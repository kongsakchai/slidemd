<script lang="ts">
	import { markdownToSlide } from '@/lib/markdown';
	import type { Slide } from '@/lib/markdown/type';

	let slide = $state<Slide>();

	$effect(() => {
		const fetchMarkdown = async () => {
			const res = await fetch('/markdown.md');
			const text = await res.text();
			slide = markdownToSlide(text);
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
