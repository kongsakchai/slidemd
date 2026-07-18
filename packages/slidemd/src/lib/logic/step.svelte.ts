import { onMount } from 'svelte'

import { useSlideContext } from '../state'

interface StepData {
	step: number
	classes: string[]
}

interface Stepper {
	element: Element
	steps: StepData[]
	curIndex: number
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
				const steps: StepData[] = []

				for (const key of el.getAttributeNames()) {
					const match = STEP_ATTR_PATTERN.exec(key)
					if (!match) continue

					const step = Number(match[1])
					slide.step = Math.max(slide.step ?? 0, step)

					const classes = el.getAttribute(key)?.split(/\s+/).filter(Boolean) ?? []
					if (classes.length > 0) steps.push({ step, classes: classes })
				}

				if (steps.length > 0) {
					steppers.push({ element: el, steps: steps, curIndex: 0 })
				}
			}

			if (steppers.length > 0) record.set(slide.page, steppers)
		}
	})

	$effect(() => {
		const currentPage = slideContext.page
		const targetStep = slideContext.step

		const steppers = record.get(currentPage)
		if (!steppers) return

		for (const sp of steppers) {
			const curStep = sp.steps[sp.curIndex].step
			if (curStep <= targetStep) {
				for (let i = sp.curIndex; i < sp.steps.length; i++) {
					if (sp.steps[i].step > targetStep) break
					sp.curIndex = i
					sp.element.classList.add(...sp.steps[i].classes)
				}
			} else if (curStep > targetStep) {
				for (let i = sp.curIndex; i >= 0; i--) {
					if (sp.steps[i].step <= targetStep) break
					sp.curIndex = i
					sp.element.classList.remove(...sp.steps[i].classes)
				}
			}
		}
	})
}
