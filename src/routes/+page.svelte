<script lang="ts">
	import { browser } from '$app/environment'
	import { directiveToStyle, setCopyCodeButton } from '$lib/slide/helper'
	import mermaid from 'mermaid'
	import { onMount } from 'svelte'

	let { data } = $props()

	mermaid.initialize({
		startOnLoad: true,
		theme: 'default',
		htmlLabels: false,
		fontFamily: 'mali'
	})

	onMount(() => {
		setCopyCodeButton(browser)
	})
</script>

<svelte:head>
	<title>{data.slide.properties.title}</title>
</svelte:head>

<svg viewBox="0 0 1280 720" class="bg-white">
	<foreignObject width="1280" height="720">
		{#each data.slide.pages as page}
			<section
				class="slide {page.directive.class}"
				class:split={page.directive.split}
				style={directiveToStyle(page.directive)}
			>
				{@html page.html}
			</section>
		{/each}
	</foreignObject>
</svg>
