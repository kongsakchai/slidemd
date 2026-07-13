import { createContext } from 'svelte'

import type { SlideData } from '../types'

export interface SlideContext {
	slide: SlideData
	totalPage: number
	page: number
	step: number
}

export enum PageAction {
	NEXT,
	PREVIOUS
}

const [getSlideContext, setSlideContext] = createContext<SlideContext>()

export function createSlideContext(slide: SlideData, page?: number) {
	const ctx = $state<SlideContext>({
		slide: slide,
		totalPage: slide.pages.length,
		page: page ?? 1,
		step: 0
	})
	setSlideContext(ctx)

	return ctx
}

export function useSlideContext() {
	const ctx = getSlideContext()
	const maxStep = $derived(ctx.slide.pages[ctx.page].step || 0)

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
			if (val > ctx.totalPage || ctx.page < 1) return
			ctx.page = val
		},
		get step() {
			return ctx.step
		},
		set step(val: number) {
			if (val > maxStep || val < 0) return
			ctx.step = val
		},
		update(action: PageAction) {
			switch (action) {
				case PageAction.NEXT:
					if (ctx.step < maxStep) {
						ctx.step += 1
					} else if (ctx.page < ctx.totalPage) {
						ctx.page += 1
						ctx.step = 0
					}
					return

				case PageAction.PREVIOUS:
					if (ctx.step > 0) {
						ctx.step -= 1
					}
					if (ctx.page > 1) {
						ctx.page -= 1
						ctx.step = ctx.slide.pages[ctx.page].step || 0
					}
					return
			}
		}
	}
}
