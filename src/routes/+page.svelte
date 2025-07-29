<script lang="ts">
	import { directiveToStyle } from '$lib/slide/helper'
	import mermaid from 'mermaid'

	let { data } = $props()

	mermaid.initialize({
		startOnLoad: true,
		theme: 'default',
		htmlLabels: false,
		fontFamily: 'mali'
	})
</script>

<svg viewBox="0 0 1280 720" class="bg-white">
	<foreignObject width="1280" height="720">
		{#each data.slide.pages as page}
			<section
				class={page.directive.class}
				class:slide={!page.directive.split}
				class:slide-split={page.directive.split}
				style={directiveToStyle(page.directive)}
			>
				{@html page.html}
			</section>
		{/each}
	</foreignObject>
</svg>
