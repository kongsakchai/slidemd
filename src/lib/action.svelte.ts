export const clickOutside = (node: HTMLElement, callback: () => void) => {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node)) {
			callback()
		}
	}

	document.addEventListener('pointerup', handleClick)

	return {
		destroy() {
			document.removeEventListener('pointerup', handleClick)
		}
	}
}

interface ClickableNode {
	node: HTMLElement
	previous: string[]
}

const clickableList = $state<Record<number, ClickableNode[]>>({})

export const onSlideChange = (currentPage: number, currentClick: number) => {
	clickableList[currentPage]?.forEach((c) => {
		const key = `click-${currentClick}`
		const next = c.node.getAttribute(key)?.split(' ') || ['']

		if (next.length > 0 || currentClick == 0) {
			c.node.classList.remove(...c.previous)
			c.node.classList.add(...next)
			c.previous = next
		}
	})
}

export const regisClickable = (node: HTMLElement, page: number) => {
	clickableList[page] ??= []
	const index = clickableList[page].push({
		node: node,
		previous: node.getAttribute('click-0')?.split(' ') || []
	})

	return {
		destroy() {
			clickableList[page].splice(index, 1)
		}
	}
}
