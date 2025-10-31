import type { StepNode } from '$lib/types'

const stepNodes = $state<Record<number, StepNode[]>>({})

export const regisSteps = (node: HTMLElement, page: number) => {
	stepNodes[page] ??= []
	const index = stepNodes[page].push({
		node: node,
		previous: node.getAttribute('step-0')?.split(' ') || []
	})

	return {
		destroy() {
			stepNodes[page].splice(index, 1)
		}
	}
}

export const updateStep = (page: number, step: number) => {
	stepNodes[page]?.forEach((c) => {
		const key = `step-${step}`
		const next = c.node.getAttribute(key)?.split(' ') || ['']

		if (next.length > 0 || step == 0) {
			c.node.classList.remove(...c.previous)
			c.node.classList.add(...next)
			c.previous = next
		}
	})
}
