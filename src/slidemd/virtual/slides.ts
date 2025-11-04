import type { Context } from '../types'
import type { VirtualModule } from './types'

export const slide: VirtualModule = {
	id: '@slidemd/slides',
	getContent(ctx?: Context) {
		const markdowns = ctx?.markdowns || []

		const slides: string[] = []
		markdowns.forEach((src) => {
			slides.push(`"${src}": async() => {`)
			slides.push(`const slide = await import('@slidemd/components/${src}.svelte')`)
			slides.push(`return { Slide:slide.default, slide:slide.slide }`)
			slides.push(`},`)
		})

		return [
			`export const slides = {`,
			...slides,
			`}`,
			`export const markdowns = ${JSON.stringify(markdowns)}`
		].join('\n')
	}
}
