<script lang="ts">
	import { replaceState } from '$app/navigation'
	import { page } from '$app/state'
	import Controller from '$lib/components/controller.svelte'
	import PreviewImage from '$lib/components/preview-image.svelte'
	import SlideContainer from '$lib/components/slide-container.svelte'
	import { updateStep } from '$lib/states/step.svelte.js'
	import { slides } from '@slidemd/slides'
	import mermaid from 'mermaid'
	import { onMount } from 'svelte'

	let { data } = $props()

	let SlideComponent = slides[data.file]?.component
	let slide = slides[data.file]?.data

	let currentPage = $derived(parseInt(page.url.hash.slice(1)) || 0)
	let currentStep = $state(0)
	let stepCount = $derived(slide.slides[currentPage - 1]?.step || 0)
	let fullscreen = $state(false)

	onMount(async () => {
		if (currentPage == 0) {
			currentPage = 1
		}
		mermaid.initialize({
			theme: 'default',
			htmlLabels: false,
			fontFamily: 'mali'
		})
		mermaid.run().then(() => console.log('Mermaid diagrams rendered'))
	})

	const onnext = () => {
		if (currentStep < stepCount) {
			currentStep += 1
		} else if (currentPage < slide.slides.length) {
			currentPage += 1
			currentStep = 0
		}
		replaceState(`#${currentPage}`, {})
		updateStep(currentPage, currentStep)
	}

	const onprevious = () => {
		if (currentStep > 0) {
			currentStep -= 1
		} else if (currentPage > 1) {
			currentPage -= 1
			currentStep = stepCount
		}
		replaceState(`#${currentPage}`, {})
		updateStep(currentPage, currentStep)
	}

	const onfullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen()
		} else {
			document.exitFullscreen()
		}
	}
</script>

<svelte:head>
	<title>{slide.title}</title>
</svelte:head>

<svelte:document onfullscreenchange={() => (fullscreen = document.fullscreenElement !== null)} />

<main class="relative h-full w-screen overflow-hidden bg-black">
	<SlideContainer>
		<SlideComponent {currentPage} />
	</SlideContainer>

	<section class=" fixed bottom-0 left-0 z-50 flex w-full p-5 transition-opacity duration-500 hover:opacity-100">
		<Controller
			page={currentPage}
			maxPage={slide.slides.length}
			{fullscreen}
			{onnext}
			{onprevious}
			{onfullscreen}
		/>
	</section>

	<PreviewImage />
</main>
