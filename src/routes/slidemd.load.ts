const customElements = import.meta.glob(['/* @custom-element */'], { eager: true })
console.log('🌱 custom elements loaded:', Object.keys(customElements).length)

const css = import.meta.glob(['../themes/*.css', '/* @themes */'], { eager: true })
console.log('🌱 themes loaded:', Object.keys(css).length)

export const themeNames = Object.keys(css)
	.filter((p) => p && /\/theme-\w+.css/.test(p))
	.map((p) => {
		return p
			.split('/')
			.pop()
			?.replace(/(\.css)|(theme-)/g, '')
	}) as string[]
