import { createContext } from 'svelte'

import type { SlideData } from '../types'

export enum Action {
	NEXT,
	NEXT_PAGE,
	PREVIOUS,
	PREV_PAGE,
	JUMP
}

interface SlideContext {
	slide: SlideData

	readonly page: number
	readonly step: number
	readonly action: number
	readonly totalPage: number
	readonly maxStep: number
	getStep(page?: number): number
	goto(page: number, step?: number, action?: Action): void
	next(): void
	previous(): void
}

class Context implements SlideContext {
	slide = $state<SlideData>({ title: '', pages: [] })

	#page = $state(1)
	#step = $state(0)
	#action = $state<Action>(Action.NEXT)

	get page() {
		return this.#page
	}
	get step() {
		return this.#step
	}
	get action() {
		return this.#action
	}
	get totalPage() {
		return this.slide.pages.length
	}
	get maxStep() {
		return this.getStep()
	}

	constructor(slide: SlideData) {
		this.slide = slide
	}

	getStep(page = this.page) {
		if (page < 1 || page > this.totalPage) return 0
		return this.slide.pages[page - 1]?.step ?? 0
	}

	goto(page: number, step = 0, action = Action.JUMP) {
		page = Math.max(1, Math.min(page, this.totalPage))
		step = Math.max(0, Math.min(step, this.getStep(page)))

		if (page === this.page && step === this.step) return

		this.#page = page
		this.#step = step
		this.#action = action
	}

	next() {
		if (this.step < this.maxStep) {
			this.goto(this.page, this.step + 1, Action.NEXT)
		} else if (this.page < this.totalPage) {
			this.goto(this.page + 1, 0, Action.NEXT_PAGE)
		}
	}

	previous() {
		if (this.step > 0) {
			this.goto(this.page, this.step - 1, Action.PREVIOUS)
		} else if (this.page > 1) {
			this.goto(this.page - 1, this.getStep(this.page - 1), Action.PREV_PAGE)
		}
	}
}

const [useSlideContext, setSlideContext] = createContext<SlideContext>()

export { useSlideContext }

export function createSlideContext(slide: SlideData) {
	return setSlideContext(new Context(slide))
}
