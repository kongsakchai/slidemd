import type { Directive } from './types'

const multipleImages = (img: string): string => {
	return img
		.split(',')
		.map((img) => `url(${img})`)
		.join(', ')
}

export const directiveToStyle = (directive?: Directive, isSplit?: boolean): string => {
	if (!directive) return ''

	const styles: string[] = []

	if (directive.style) {
		styles.push(directive.style)
	}
	if (directive.bgImg) {
		styles.push(`background-image: ${multipleImages(directive.bgImg)}`)
	}
	if (directive.bgColor) {
		styles.push(`background-color: ${directive.bgColor}`)
	}
	if (directive.bgSize) {
		styles.push(`background-size: ${directive.bgSize}`)
	}
	if (directive.bgPosition) {
		styles.push(`background-position: ${directive.bgPosition}`)
	}
	if (directive.bgRepeat) {
		styles.push(`background-repeat: ${directive.bgRepeat}`)
	}

	if (isSplit) {
		switch (directive.splitDir) {
			case 'vertical':
				styles.push(`--split-row: var(--split-size)`)
				break
			default:
				styles.push(`--split-col: var(--split-size)`)
				break
		}
	}

	return styles.join('; ').replace(/;{2,}/g, ';').trim()
}

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
