<script lang="ts">
	import { replaceState } from '$app/navigation'
	import { page } from '$app/state'

	import PreviewImage from '$lib/components/preview-image.svelte'
	import { updateStep } from '$lib/states/step.svelte'
	import type { SlideComponent } from '@slidemd/slides'

	import SlideContainer from './slide-container.svelte'
	import Controller from './slide-controller.svelte'

	import mermaid from 'mermaid'
	import { onMount } from 'svelte'

	let { Slide, slide }: SlideComponent = $props()

	let currentPage = $derived(parseInt(page.url.hash.slice(1)) || 0)
	let currentStep = $state(0)
	let stepCount = $derived(slide?.slides[currentPage - 1]?.step || 0)
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
		} else if (currentPage < (slide?.slides.length || 0)) {
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
	<title>{slide?.title}</title>
</svelte:head>

<svelte:document onfullscreenchange={() => (fullscreen = document.fullscreenElement !== null)} />

<SlideContainer>
	<Slide {currentPage} />
</SlideContainer>

<Controller page={currentPage} maxPage={slide?.slides.length || 0} {fullscreen} {onnext} {onprevious} {onfullscreen} />

<PreviewImage />
