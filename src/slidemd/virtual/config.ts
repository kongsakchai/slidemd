import type { VirtualModule } from './types'

export const config: VirtualModule = {
	id: '@slidemd/config',
	getContent() {
		const imports: string[] = []
		const themesName: string[] = []

		const css = this.css()
		css.forEach((f) => {
			for (const match of f.matchAll(/theme-(.*).css/g)) {
				if (!match[1]) return
				themesName.push(match[1])
			}
			imports.push(`import '${f}'`)
		})

		const content = [...imports, `export const themes = ${JSON.stringify(themesName)}`].join('\n')
		this.writeCache('theme', content)

		return content
	}
}
