<script lang="ts">
	import { browser } from '$app/environment'
	import Controller from '$lib/components/controller.svelte'
	import { directiveToStyle, setCopyCodeButton } from '$lib/slide/helper'
	import { settings } from '$lib/state.svelte.js'
	import mermaid from 'mermaid'
	import { onMount } from 'svelte'

	const initWidth = 1280

	let { data } = $props()

	let screenWidth = $state(1280)
	let screenHeight = $state(720)

	let size = $derived.by(() => {
		if (screenWidth / settings.aspectRatio > screenHeight) {
			return screenHeight / (settings.width / settings.aspectRatio)
		}
		return screenWidth / settings.width
	})

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
		if (currentPage < data.slide.pages.length) currentPage += 1
	}

	const previousPage = () => {
		if (currentPage > 1) currentPage -= 1
	}
</script>

<svelte:head>
	<title>{data.slide.properties.title}</title>
</svelte:head>

<svelte:body bind:clientWidth={screenWidth} bind:clientHeight={screenHeight} />

<main class="flex h-full w-full flex-col items-center justify-center">
	<div
		class="flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ease-in-out"
		class:rounded-lg={settings.size !== 1}
		style:width="{settings.width}px"
		style:scale={size * settings.size}
		style:font-size={settings.fontSize + 'px'}
	>
		{#each data.slide.pages as page, i}
			<section
				class="slide {page.directive.class}"
				class:split={page.directive.split}
				class:hidden={currentPage !== i + 1}
				style={directiveToStyle(page.directive)}
				style:aspect-ratio={settings.aspectRatio}
			>
				{@html page.html}
			</section>
		{/each}
	</div>

	<Controller
		{currentPage}
		maxPage={data.slide.pages.length}
		disabledNext={currentPage === data.slide.pages.length}
		disabledPrevious={currentPage === 1}
		onNext={nextPage}
		onPrevious={previousPage}
	/>
</main>
