<script lang="ts">
	import { directiveToStyle } from '$lib/utils.js'

	let { data } = $props()
</script>

<svg viewBox="0 0 1280 720" class="bg-white">
	<foreignObject width="1280" height="720">
		{#each data.slide.pages as page}
			<section class="slide {page.directive?.class}" style={directiveToStyle(page.directive)}>
				{@html page.html}
			</section>
		{/each}
	</foreignObject>
</svg>
