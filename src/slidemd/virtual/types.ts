import type { SlideMDContext } from '../types'

export interface VirtualModule {
	id: string
	getContent: (this: SlideMDContext) => string | Promise<string>
}
