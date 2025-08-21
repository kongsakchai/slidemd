export const setCopyCodeButton = (isBrowser: boolean) => {
	if (!isBrowser) return false

	const copyCode = (code: string, button: HTMLButtonElement) => {
		navigator.clipboard.writeText(code)
		button.classList.add('copied')
		setTimeout(() => {
			button.classList.remove('copied')
		}, 1000)
	}

	const copyButtons = document.querySelectorAll('button.copy')
	copyButtons.forEach((button) => {
		const pre = button.parentNode?.querySelector('pre')
		if (!pre) return

		if (button instanceof HTMLButtonElement) {
			button.onclick = () => copyCode(pre.innerText, button)
		}
	})

	return true
}
