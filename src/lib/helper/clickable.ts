export const parseClickValue = (clickValue = '') => {
	const regexp = /(\d+):(?:([^,]+))/g
	const clickData: Record<string, string[]> = {}

	for (const match of clickValue.matchAll(regexp)) {
		const key = match[1]
		const val = match[2]
		clickData[key] = val.split(' ')
	}

	return clickData
}

export const setClickable = (browser: boolean) => {
	if (!browser) return {}

	const pages = document.querySelectorAll<HTMLElement>('[data-page]').values()
	return pages.reduce(
		(acc, page) => {
			const pageNo = Number(page.dataset.page) || 0
			if (pageNo === 0) return acc

			const clickElements = page.querySelectorAll<HTMLElement>('[click]').values()
			acc[pageNo] = [...clickElements.map((el) => new Clickable(el))]
			return acc
		},
		{} as Record<number, Clickable[]>
	)
}

export class Clickable {
	element: HTMLElement
	data: Record<string, string[]>
	prev: number

	constructor(element: HTMLElement) {
		this.element = element
		this.data = parseClickValue(element.getAttribute('click') || '')
		this.prev = 0
	}

	click(clickStep: number) {
		const newClasses = this.data[clickStep]
		const previousClasses = this.data[this.prev]

		// remove classes when has next step or clickStep is 0
		if (previousClasses && (newClasses || clickStep === 0)) {
			this.removeClasses(previousClasses)
		}

		// add classes for new step
		if (newClasses) {
			this.addClasses(newClasses)
			this.prev = clickStep
		}
	}

	private removeClasses(classes: string[]): void {
		this.element.classList.remove(...classes)
	}

	private addClasses(classes: string[]): void {
		this.element.classList.add(...classes)
	}
}
