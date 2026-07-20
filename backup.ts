/* eslint-disable svelte/prefer-svelte-reactivity */
import { onMount, untrack } from 'svelte';

import { State, useSlideContext } from '../state';

interface StepData {
	element: Element
	class: string[]
	action: 'add' | 'remove'
}

type PageStep = Record<number, [number, StepData[]][]>

const STEP_ATTR_PATTERN = /^step-(\d+)(?:-(\d+))?$/

export function initStep() {
	const slideContext = useSlideContext()
	const record: PageStep = {}

	let currentIndex = 0

	onMount(() => {
		for (const slide of slideContext.slide.pages) {
			const page = document.querySelector(`[data-page="${slide.page}"]`)
			if (!page) continue

			const stepList = new Map<number, StepData[]>()
			for (const el of page.querySelectorAll(`[step]`)) {
				for (const key of el.getAttributeNames()) {
					const match = STEP_ATTR_PATTERN.exec(key)
					if (!match) continue
					const classes = el.getAttribute(key)?.split(/\s+/).filter(Boolean) ?? []

					const stepAdd = Number.parseInt(match[1])
					if (!stepList.has(stepAdd)) stepList.set(stepAdd, [])
					stepList.get(stepAdd)?.push({
						element: el,
						action: 'add',
						class: classes
					})

					if (!match[2]) continue
					const stepRm = Number.parseInt(match[2])
					if (!stepList.has(stepRm)) stepList.set(stepRm, [])
					stepList.get(stepRm)?.push({
						element: el,
						action: 'remove',
						class: classes
					})
				}
			}

			record[slide.page] = [...stepList.entries()].sort((a, b) => a[0] - b[0])
			slide.step = record[slide.page].at(-1)?.[0]
		}
	})

	$effect(() => {
		if (slideContext.page) {
			const state = untrack(() => slideContext.state)
			currentIndex = state === State.NEXT ? 0 : record[slideContext.page].length
		}
	})

	$effect(() => {
		const slideList = record[slideContext.page]
		if (slideList.length === 0) return

		if (slideContext.state === State.NEXT) {
			while (currentIndex < slideList.length && slideList[currentIndex][0] <= slideContext.step) {
				slideList[currentIndex++][1].forEach((s) => {
					if (s.action === 'add') {
						s.element.classList.add(...s.class)
					} else {
						s.element.classList.remove(...s.class)
					}
				})
			}
		} else {
			while (currentIndex > 0 && slideList[currentIndex - 1][0] > slideContext.step) {
				slideList[--currentIndex][1].forEach((s) => {
					if (s.action === 'remove') {
						s.element.classList.add(...s.class)
					} else {
						s.element.classList.remove(...s.class)
					}
				})
			}
		}
	})
}
