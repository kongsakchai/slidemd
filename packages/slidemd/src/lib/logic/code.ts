export function initCopyCode() {
	const copyCode = (e: Event) => {
		const button = e.currentTarget as HTMLButtonElement
		const pre = button.parentNode?.querySelector('pre')
		if (!pre) return

		navigator.clipboard.writeText(pre.innerText)
		button.classList.add('copied')
		setTimeout(() => {
			button.classList.remove('copied')
		}, 1000)
	}

	window.copyCode = copyCode
}

declare global {
	interface Window {
		copyCode: (e: Event) => void
	}
}
