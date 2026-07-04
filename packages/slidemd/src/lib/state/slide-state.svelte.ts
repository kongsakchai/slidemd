import type { SlideData } from '@slidemd/slidemd/types'

export enum PageAction {
	NEXT,
	PREVIOUS
}

export class SlideState {
	readonly #slide = $state<SlideData>({ title: '', markdown: '', pages: [] })
	readonly #maxPage = $derived(this.#slide?.pages.length || 0)

	#page = $state(1)
	#step = $state(0)

	#zoom = $state(1)
	#fontSize = $state(16)
	#scale = $state(1)

	constructor(data: SlideData) {
		this.#slide = data
	}

	get page() {
		return this.#page
	}

	get step() {
		return this.#step
	}

	get maxPage() {
		return this.#maxPage
	}

	get maxStep() {
		return this.#slide.pages[this.#page - 1].step || 0
	}

	get zoom() {
		return this.#zoom
	}

	set zoom(val: number) {
		this.#zoom = val
	}

	get fontSize() {
		return this.#fontSize
	}

	set fontSize(val: number) {
		this.#fontSize = val
	}

	get scale() {
		return this.#scale
	}

	set scale(val: number) {
		this.#scale = val
	}

	initial() {}

	update(action: PageAction) {
		switch (action) {
			case PageAction.NEXT:
				if (this.#step < this.maxStep) {
					this.#step += 1
				} else if (this.#page < this.#slide.pages.length) {
					this.#page += 1
				}
				return

			case PageAction.PREVIOUS:
				if (this.#step > 0) {
					this.#step -= 1
				}
				if (this.#page > 1) {
					this.#page -= 1
				}
				return
		}
	}

	resetZoom() {
		this.#zoom = 1
	}

	resetFontSize() {
		this.#fontSize = 16
	}

	resetScale() {
		this.#scale = 1
	}
}
