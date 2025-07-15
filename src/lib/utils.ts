import type { Directive } from './types'

const multipleImages = (img: string): string => {
	return img
		.split(',')
		.map((img) => `url(${img})`)
		.join(', ')
}

export const directiveToStyle = (directive?: Directive): string => {
	if (!directive) return ''

	const styles: string[] = []

	if (directive.style) {
		styles.push(directive.style)
	}
	if (directive.color) {
		styles.push(`color: ${directive.color}`)
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

	return styles.join(';').replaceAll(/;{2,}/g, ';')
}
