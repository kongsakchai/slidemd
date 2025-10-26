import type { StepNode } from './types'

export const clickOutside = (node: HTMLElement, callback: () => void) => {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node)) callback()
	}
	document.addEventListener('pointerup', handleClick)
	return {
		destroy() {
			document.removeEventListener('pointerup', handleClick)
		}
	}
}

export const copyCode = (e: Event) => {
	const button = e.currentTarget as HTMLButtonElement
	const pre = button.parentNode?.querySelector('pre')
	if (!pre) return

	navigator.clipboard.writeText(pre.innerText)
	button.classList.add('copied')
	setTimeout(() => {
		button.classList.remove('copied')
	}, 1000)
}

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
