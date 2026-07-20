import { createContext } from 'svelte'

import type { SlideData } from '../types'

export interface SlideContext {
	slide: SlideData
	totalPage: number
	page: number
	step: number
	state: State
}

export enum State {
	NEXT,
	NEXT_PAGE,
	PREVIOUS,
	PREV_PAGE,
	JUMP
}

const [getSlideContext, setSlideContext] = createContext<SlideContext>()

export function createSlideContext(slide: SlideData, page?: number) {
	const ctx = $state<SlideContext>({
		slide: slide,
		totalPage: slide.pages.length,
		page: page ?? 1,
		step: 0,
		state: State.NEXT
	})
	setSlideContext(ctx)
	return wrapSlideContext(ctx)
}

export function useSlideContext() {
	const ctx = getSlideContext()
	return wrapSlideContext(ctx)
}

function wrapSlideContext(ctx: SlideContext) {
	const maxStep = $derived(ctx.slide.pages[ctx.page - 1].step || 0)

	return {
		get slide() {
			return ctx.slide
		},
		get totalPage() {
			return ctx.totalPage
		},
		get page() {
			return ctx.page
		},
		set page(val: number) {
			if (val > ctx.totalPage || val < 1) return
			ctx.page = val
		},
		get step() {
			return ctx.step
		},
		set step(val: number) {
			if (val > maxStep || val < 0) return
			ctx.step = val
		},
		get maxStep() {
			return maxStep
		},
		get state() {
			return ctx.state
		},
		update(action: State) {
			switch (action) {
				case State.NEXT:
					if (ctx.step < maxStep) {
						ctx.step += 1
						ctx.state = action
					} else if (ctx.page < ctx.totalPage) {
						ctx.page += 1
						ctx.step = 0
						ctx.state = State.NEXT_PAGE
					}
					return

				case State.PREVIOUS:
					if (ctx.step > 0) {
						ctx.step -= 1
						ctx.state = action
					}
					if (ctx.page > 1) {
						ctx.page -= 1
						ctx.step = ctx.slide.pages[ctx.page - 1].step || 0
						ctx.state = State.PREV_PAGE
					}
					return
			}
		}
	}
}
