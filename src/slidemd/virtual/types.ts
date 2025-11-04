import type { Context } from '../types'

export interface VirtualModule {
	id: string
	getContent: (ctx?: Context) => string | Promise<string>
}
