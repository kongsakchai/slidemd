import { useSlideContext } from '../state'

interface ElementStepper {
	element: Element
	previous?: string[]
}

export function initStep() {
	const slideContext = useSlideContext()
	const record: Record<number, ElementStepper[]> = {}

	$effect(() => {
		const page = slideContext.page
		const step = slideContext.step

		console.log(page, step)
		if (!record[page]) {
			const element = document.querySelector(`[data-page="${page}"]`)
			const children = element?.querySelectorAll('[step]') || []
			record[page] = [...children].map((e) => ({ element: e }))
		}

		if (record[page].length == 0) return

		for (const st of record[page]) {
			const value = st.element.getAttribute(`step-${step}`)
			if (!value) continue

			if (st.previous) {
				st.element.classList.remove(...st.previous)
			}
			const newClass = value.split(' ')
			st.element.classList.add(...newClass)
			st.previous = newClass
		}
	})
}
