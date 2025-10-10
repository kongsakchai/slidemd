import type { Context } from '../types'

export interface VirtualModule {
	id: string
	getContent: (this: Context) => string | Promise<string>
}
