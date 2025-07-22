<script lang="ts">
	import { directiveToStyle } from '$lib/helper'

	let { data } = $props()
</script>

<svg viewBox="0 0 1280 720" class="bg-white">
	<foreignObject width="1280" height="720">
		{#each data.slide.pages as page}
			<section class="slide {page.directive?.class} p-10" style={directiveToStyle(page.directive)}>
				{@html page.html}
			</section>
		{/each}
	</foreignObject>
</svg>
