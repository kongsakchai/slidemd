import type { Context, Theme } from '../types'
import type { VirtualModule } from './types'

export const theme: VirtualModule = {
	id: '@slidemd/themes',
	getContent(ctx?: Context) {
		const imports: string[] = []
		const themes: Theme[] = []

		ctx?.css?.forEach((f: string) => {
			const match = [...f.matchAll(/theme-([\s\S]+).css/g)]
			if (match.length === 0) return

			themes.push({ name: match[0][1] })
			imports.push(`import '${f}'`)
		})

		ctx?.builtinCSS?.forEach((f: string) => {
			const match = [...f.matchAll(/theme-(.*).css/g)]
			if (match.length === 0) return

			const duplicate = themes.some(({ name }) => name == match[0][1])
			if (!duplicate) {
				themes.push({ name: match[0][1], builtin: true })
				imports.push(`import '${f}'`)
			}
		})

		const content = [...imports, `export const themes = ${JSON.stringify(themes)}`].join('\n')
		return content
	}
}
