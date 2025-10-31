import type { Theme } from '../types'
import type { VirtualModule } from './types'

export const config: VirtualModule = {
	id: '@slidemd/config',
	getContent() {
		const imports: string[] = []
		const themes: Theme[] = []

		this.css().css.forEach((f) => {
			for (const match of f.matchAll(/theme-(.*).css/g)) {
				if (match[1]) themes.push({ name: match[1], builtin: false })
			}
			imports.push(`import '${f}'`)
		})
		this.css().builtin.forEach((f) => {
			for (const match of f.matchAll(/theme-(.*).css/g)) {
				const duplicate = themes.some(({ name }) => name == match[1])
				if (match[1] && !duplicate) {
					themes.push({ name: match[1], builtin: true })
					imports.push(`import '${f}'`)
				}
			}
		})

		const content = [...imports, `export const themes = ${JSON.stringify(themes)}`].join('\n')
		return content
	}
}
