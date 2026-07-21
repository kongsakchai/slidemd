/* eslint-disable svelte/prefer-svelte-reactivity */
import { onMount } from 'svelte'

import { State, useSlideContext } from '../state'

interface StepData {
	class: string[]
	action: 'add' | 'remove'
}

type StepList = [number, StepData[]][]

interface Stepper {
	maxStep: number
	next: (step: number) => void
	prev: (step: number) => void
}

const STEP_ATTR_PATTERN = /^step-(\d+)(?:-(\d+))?$/
const CODE_BLOCK_PATTERN = /language-\w+/

function extractSteps(el: Element): StepList {
	const stepList = new Map<number, StepData[]>()

	for (const key of el.getAttributeNames()) {
		const match = STEP_ATTR_PATTERN.exec(key)
		if (!match) continue
		const classes = el.getAttribute(key)?.split(/\s+/).filter(Boolean) ?? []
		if (classes.length === 0) continue

		const stepAdd = Number.parseInt(match[1], 10)
		if (!stepList.has(stepAdd)) stepList.set(stepAdd, [])
		stepList.get(stepAdd)?.push({ action: 'add', class: classes })

		if (!match[2]) continue
		const stepRm = Number.parseInt(match[2], 10)
		if (!stepList.has(stepRm)) stepList.set(stepRm, [])
		stepList.get(stepRm)?.push({ action: 'remove', class: classes })
	}

	return [...stepList.entries()].sort((a, b) => a[0] - b[0])
}

function createStepper(element: Element): Stepper {
	const stepsList = extractSteps(element)
	let index = 0

	const applyForward = (steps: StepData[]) => {
		steps.forEach((data) => {
			if (data.action === 'add') {
				element.classList.add(...data.class)
			} else {
				element.classList.remove(...data.class)
			}
		})
	}

	const applyBackward = (steps: StepData[]) => {
		steps.forEach((data) => {
			if (data.action === 'remove') {
				element.classList.add(...data.class)
			} else {
				element.classList.remove(...data.class)
			}
		})
	}

	const next = (step: number) => {
		while (index < stepsList.length && stepsList[index][0] <= step) {
			applyForward(stepsList[index++][1])
		}
	}

	const prev = (step: number) => {
		while (index > 0 && stepsList[index - 1][0] > step) {
			applyBackward(stepsList[--index][1])
		}
	}

	return { next, prev, maxStep: stepsList.at(-1)?.[0] ?? 0 }
}

export function initStep() {
	const slideContext = useSlideContext()
	const record: Record<number, Stepper[]> = {}

	onMount(() => {
		for (const page of slideContext.slide.pages) {
			const pageEl = document.querySelector(`[data-page="${page.page}"]`)
			if (!pageEl) continue

			record[page.page] = []
			for (const el of pageEl.querySelectorAll(`[step]`)) {
				if (CODE_BLOCK_PATTERN.test(el.className)) {
					const step = el.getAttribute('step') || '0'
					console.log(step)
					page.step = Math.max(Number.parseInt(step), page.step ?? 0)
					continue
				}

				const stepper = createStepper(el)
				record[page.page].push(stepper)
				page.step = Math.max(stepper.maxStep, page.step ?? 0)
			}
		}
	})

	$effect(() => {
		const steppers = record[slideContext.page]
		if (!steppers) return

		const targetStep = slideContext.step
		const isForward = slideContext.state === State.NEXT || slideContext.state === State.PREV_PAGE

		steppers.forEach((s) => (isForward ? s.next(targetStep) : s.prev(targetStep)))
	})
}
