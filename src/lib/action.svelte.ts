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
