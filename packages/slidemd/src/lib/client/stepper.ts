import { State, useSlideContext } from '../state'
import type { Step, Stepper } from '../step'

const next = (node: HTMLElement, stepper: Stepper, step: number) => {
	const steps = stepper.steps
	let index = stepper.index
	while (index < steps.length && steps[index][0] <= step) {
		steps[index++][1].forEach((data) => {
			if (data.action === 'add') {
				node.classList.add(...data.class)
			} else {
				node.classList.remove(...data.class)
			}
		})
	}
	stepper.index = index
}

const prev = (node: HTMLElement, stepper: Stepper, step: number) => {
	const steps = stepper.steps
	let index = stepper.index
	while (index > 0 && steps[index - 1][0] > step) {
		steps[--index][1].forEach((data) => {
			if (data.action === 'remove') {
				node.classList.add(...data.class)
			} else {
				node.classList.remove(...data.class)
			}
		})
	}
	stepper.index = index
}

const cache = new WeakMap<HTMLElement, Stepper>()

export function stepper(page: number, steps: Step[]) {
	const slideCtx = useSlideContext()

	return (node: HTMLElement) => {
		if (slideCtx.page !== page) return
		if (!cache.has(node)) cache.set(node, { index: 0, steps: steps })

		const stepper = cache.get(node)!

		if (slideCtx.state === State.PREVIOUS) {
			prev(node, stepper, slideCtx.step)
		} else {
			next(node, stepper, slideCtx.step)
		}
	}
}
