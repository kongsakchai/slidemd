<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import Controller from '$lib/components/controller.svelte'
	import PreviewImage from '$lib/components/preview-image.svelte'
	import { Clickable, setClickable } from '$lib/helper/clickable'
	import { setCopyCodeButton } from '$lib/helper/copy-code'
	import { settings } from '$lib/state.svelte'
	import mermaid from 'mermaid'
	import { onMount } from 'svelte'
	import slides from 'virtual:slidemd'

	// const slidesData: Record<string, Slide> = {
	// 	/* @slides-data */
	// }

	let start = $state(false)

	let file = $derived.by(() => {
		let file = page.params.file
		if (file?.endsWith('/')) {
			return file.slice(0, -1)
		}
		return file
	})

	let Slide = slides[file || '']?.component
	let slide = slides[file || '']?.data

	let screenWidth = $state(1280)
	let screenHeight = $state(720)

	let size = $derived.by(() => {
		if (screenWidth / settings.aspectRatio > screenHeight) {
			return screenHeight / (settings.width / settings.aspectRatio)
		}
		return screenWidth / settings.width
	})

	let currentPage = $derived(page.url.hash ? parseInt(page.url.hash.slice(1)) || 1 : 1)
	let currentClick = $state(0)
	let maxClicks = $derived(slide?.pages[currentPage - 1].click || 0)

	let clickableMap: Record<number, Clickable[]> = {}

	mermaid.initialize({
		theme: 'default',
		htmlLabels: false,
		fontFamily: 'mali'
	})

	onMount(async () => {
		setCopyCodeButton(browser)
		clickableMap = setClickable(browser)

		mermaid.run().then(() => console.log('Mermaid diagrams rendered'))

		setTimeout(() => {
			start = true
		}, 500)
	})

	const nextPage = () => {
		if (currentClick < maxClicks) {
			currentClick += 1
			return
		}
		if (currentPage < slide.pages.length) {
			currentPage += 1
			currentClick = 0
		}
	}

	const previousPage = () => {
		if (currentClick > 0) {
			currentClick -= 1
		}
		if (currentPage > 1) {
			currentPage -= 1
			currentClick = maxClicks
		}
	}

	$effect(() => {
		clickableMap[currentPage]?.forEach((c) => c.click(currentClick))
		goto(`#${currentPage}`, { replaceState: true })
	})
</script>

<svelte:head>
	<title>{slide.properties.title}</title>
</svelte:head>

<svelte:body bind:clientWidth={screenWidth} bind:clientHeight={screenHeight} />

<main class="relative h-full w-screen overflow-hidden bg-black">
	<div
		class="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col overflow-auto transition-all duration-300 ease-in-out"
		class:opacity-0={!start}
		class:rounded-2xl={settings.size !== 1}
		style:width="{settings.width}px"
		style:height="{settings.width / settings.aspectRatio}px"
		style:scale={size * settings.size}
		style:font-size={settings.fontSize + 'px'}
	>
		<Slide {currentPage} />
	</div>

	<section
		class="fixed bottom-0 left-0 z-50 flex w-full p-5 opacity-0 transition-opacity duration-500 hover:opacity-100"
	>
		<Controller
			{currentPage}
			maxPage={slide.pages.length}
			disabledNext={currentPage === slide.pages.length && currentClick >= maxClicks}
			disabledPrevious={currentPage === 1 && currentClick === 0}
			onNext={nextPage}
			onPrevious={previousPage}
		/>
	</section>

	<PreviewImage />
</main>
