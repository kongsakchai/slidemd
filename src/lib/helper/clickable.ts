const parserClickData = (clickValue = '') => {
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
	length: number
	prev: number

	constructor(element: HTMLElement) {
		this.element = element
		this.data = parserClickData(element.getAttribute('click') || '')
		this.length = Object.keys(this.data).length
		this.prev = 0
	}

	click(clickStep: number) {
		const newClasses = this.data[clickStep]
		const previousClasses = this.data[this.prev]

		console.log(newClasses, previousClasses)

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
