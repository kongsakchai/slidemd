<script lang="ts">
	import { browser } from '$app/environment'
	import Controller from '$lib/components/controller.svelte'
	import PreviewImage from '$lib/components/preview-image.svelte'
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

<main class="relative h-full w-screen overflow-hidden">
	<div
		class="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col overflow-auto transition-all duration-300 ease-in-out"
		class:rounded-lg={settings.size !== 1}
		style:width="{settings.width}px"
		style:height="{settings.width / settings.aspectRatio}px"
		style:scale={size * settings.size}
		style:font-size={settings.fontSize + 'px'}
	>
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

	<section
		class="fixed bottom-0 left-0 z-50 flex w-full p-5 opacity-0 transition-opacity duration-500 hover:opacity-100"
	>
		<Controller
			{currentPage}
			maxPage={data.slide.pages.length}
			disabledNext={currentPage === data.slide.pages.length}
			disabledPrevious={currentPage === 1}
			onNext={nextPage}
			onPrevious={previousPage}
		/>
	</section>

	<PreviewImage />
</main>
