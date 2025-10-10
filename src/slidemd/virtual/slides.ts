import type { VirtualModule } from './types'

export const slide: VirtualModule = {
	id: '@slidemd',
	getContent() {
		const imports: string[] = []
		const slides: string[] = []
		const markdowns = this.load()

		markdowns.forEach((src, i) => {
			imports.push(`import Slide_${i}, {meta as Data_${i}} from '@slidemd/components/${src}'`)
			slides.push(`"${src}":{ component:Slide_${i}, data:Data_${i} }`)
		})

		return [
			...imports,
			`export const slides = {`,
			...slides,
			`}`,
			`export const markdowns = ${JSON.stringify(markdowns)}`
		].join('\n')
	}
}
