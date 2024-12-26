<script lang="ts">
	import { createSlideRenderer } from '@/lib/slides';
	import Controller from './Controller.svelte';

	interface Props {
		markdown: string;
	}

	let { markdown }: Props = $props();
	let { render } = createSlideRenderer();

	let page = $state(1);
	let slide = $derived(render(markdown));
</script>

{#each slide.htmls as html, i}
	<svg viewBox="0 0 1280 720" class:hidden={i !== page}>
		<foreignObject width="1280" height="720">
			<section>{@html html}</section>
		</foreignObject>
	</svg>

	<Controller {page} maxPage={slide.htmls.length} nextpage={() => page++} prevpage={() => page--} />
{:else}
	<p>Loading</p>
{/each}
