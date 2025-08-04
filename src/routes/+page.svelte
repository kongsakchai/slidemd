<script lang="ts">
	import { browser } from '$app/environment'
	import Controller from '$lib/components/controller.svelte'
	import { directiveToStyle, setCopyCodeButton } from '$lib/slide/helper'
	import mermaid from 'mermaid'
	import { onMount } from 'svelte'

	let { data } = $props()

	let screenWidth = $state(1280)
	let size = $derived(screenWidth / 1280)

	let currentPage = $state(1)

	mermaid.initialize({
		startOnLoad: true,
		theme: 'default',
		htmlLabels: false,
		fontFamily: 'mali'
	})

	onMount(() => {
		setCopyCodeButton(browser)
	})

	const nextPage = () => {
		if (currentPage < data.slide.pages.length) {
			currentPage += 1
		}
	}

	const previousPage = () => {
		if (currentPage > 1) {
			currentPage -= 1
		}
	}
</script>

<svelte:head>
	<title>{data.slide.properties.title}</title>
</svelte:head>

<svelte:body bind:clientWidth={screenWidth} />

<main class="flex w-full flex-col items-center">
	<div style:width="1280px" style:height="720px" style:scale={size}>
		{#each data.slide.pages as page, i}
			<section
				class="slide {page.directive.class}"
				class:split={page.directive.split}
				class:hidden={currentPage !== i + 1}
				style={directiveToStyle(page.directive)}
			>
				{@html page.html}
			</section>
		{/each}
	</div>
</main>

<Controller
	{currentPage}
	maxPage={data.slide.pages.length}
	disabledNext={currentPage === data.slide.pages.length}
	disabledPrevious={currentPage === 1}
	onNext={nextPage}
	onPrevious={previousPage}
/>
