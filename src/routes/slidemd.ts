const customElements = import.meta.glob(['/* @custom-element-pattern */'], { eager: true })
console.log('🌱 custom elements loaded:', Object.keys(customElements).length)

const themesLoaded = import.meta.glob(['../themes/*.css', '/* @themes-pattern */'], { eager: true })
console.log('🌱 themes loaded:', Object.keys(themesLoaded).length)

const mapCSSPathToName = (path: string) => {
	return path.split('/').pop()?.replace('.css', '')
}

export const themeNames = Object.keys(themesLoaded).map(mapCSSPathToName).filter(Boolean) as string[]
