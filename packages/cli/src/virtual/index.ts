import { virtualLayout } from './layout'
import { virtualMarkdown } from './markdown'
import { virtualSlides } from './slides'
import { virtualAppCSS } from './styles'
import { VirtualModule } from './types'

export * from './layout'
export * from './markdown'
export * from './slides'
export * from './styles'
export * from './types'

export const exactModules = new Map<string, VirtualModule>([
	[virtualSlides.id, virtualSlides],
	[virtualAppCSS.id, virtualAppCSS]
])

export const prefixModules: [prefix: string, mod: VirtualModule][] = [
	[virtualLayout.id, virtualLayout],
	[virtualMarkdown.id, virtualMarkdown]
]

export function resolveModule(id: string) {
	return exactModules.get(id) ?? prefixModules.find(([prefix]) => id.startsWith(prefix))?.[1]
}
