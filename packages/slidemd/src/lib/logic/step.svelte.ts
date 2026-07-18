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

interface SlidePage {
	page: number
	step?: number
}

const STEP_ATTR_PATTERN = /^step-(\d+)$/

function parseStepData(el: Element, slide: SlidePage): StepData[] {
	const steps: StepData[] = []

	for (const key of el.getAttributeNames()) {
		const match = STEP_ATTR_PATTERN.exec(key)
		if (!match) continue

		const step = Number(match[1])
		slide.step = Math.max(slide.step ?? 0, step)

		const classes = el.getAttribute(key)?.split(/\s+/).filter(Boolean) ?? []
		if (classes.length > 0) steps.push({ step, classes })
	}

	// attribute order isn't guaranteed to match step order, so sort explicitly
	return steps.sort((a, b) => a.step - b.step)
}

function buildSteppers(page: Element, slide: SlidePage): Stepper[] {
	const steppers: Stepper[] = []

	for (const el of page.querySelectorAll(`[step]`)) {
		const steps = parseStepData(el, slide)
		if (steps.length === 0) continue

		steppers.push({ element: el, steps, curIndex: 0 })
	}

	return steppers
}

function advanceStepper(sp: Stepper, targetStep: number) {
	for (let i = sp.curIndex; i < sp.steps.length; i++) {
		if (sp.steps[i].step > targetStep) break
		sp.curIndex = i
		sp.element.classList.add(...sp.steps[i].classes)
	}
}

function retreatStepper(sp: Stepper, targetStep: number) {
	for (let i = sp.curIndex; i >= 0; i--) {
		if (sp.steps[i].step <= targetStep) break
		sp.curIndex = i
		sp.element.classList.remove(...sp.steps[i].classes)
	}
}

function applyStepper(sp: Stepper, targetStep: number) {
	const curStep = sp.steps[sp.curIndex].step

	if (curStep <= targetStep) {
		advanceStepper(sp, targetStep)
	} else {
		retreatStepper(sp, targetStep)
	}
}

export function initStep() {
	const slideContext = useSlideContext()
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const record = new Map<number, Stepper[]>()

	onMount(() => {
		for (const slide of slideContext.slide.pages) {
			const page = document.querySelector(`[data-page="${slide.page}"]`)
			if (!page) continue

			const steppers = buildSteppers(page, slide)
			if (steppers.length > 0) record.set(slide.page, steppers)
		}
	})

	$effect(() => {
		const currentPage = slideContext.page
		const targetStep = slideContext.step

		const steppers = record.get(currentPage)
		if (!steppers) return

		for (const sp of steppers) {
			applyStepper(sp, targetStep)
		}
	})
}
