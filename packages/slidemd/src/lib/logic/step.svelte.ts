import { onMount } from 'svelte'

import { useSlideContext } from '../state'

interface Stepper {
	element: Element
	step: Map<number, string[]>
}

const STEP_ATTR_PATTERN = /^step-(\d+)$/

export function initStep() {
	const slideContext = useSlideContext()
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const record = new Map<number, Stepper[]>()

	onMount(() => {
		for (const slide of slideContext.slide.pages) {
			const page = document.querySelector(`[data-page="${slide.page}"]`)
			if (!page) continue

			const elements = page.querySelectorAll(`[step]`)
			if (elements.length === 0) continue

			const steppers: Stepper[] = []

			for (const el of elements) {
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				const stepMap = new Map<number, string[]>()

				for (const key of el.getAttributeNames()) {
					const match = STEP_ATTR_PATTERN.exec(key)
					if (!match) continue

					const step = Number(match[1])
					slide.step = Math.max(slide.step ?? 0, step)

					const classes = el.getAttribute(key)?.split(/\s+/).filter(Boolean) ?? []
					if (classes.length > 0) stepMap.set(step, classes)
				}

				if (stepMap.size > 0) {
					steppers.push({ element: el, step: stepMap })
				}
			}

			if (steppers.length > 0) record.set(slide.page, steppers)
		}
	})

	$effect(() => {
		const currentPage = slideContext.page
		const currentStep = slideContext.step

		const steppers = record.get(currentPage)
		if (!steppers) return

		for (const st of steppers) {
			for (const [step, classes] of st.step) {
				if (step <= currentStep) {
					st.element.classList.add(...classes)
				} else {
					st.element.classList.remove(...classes)
				}
			}
		}
	})
}
