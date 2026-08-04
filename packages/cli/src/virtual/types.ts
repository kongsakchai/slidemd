export interface Context {
	root: string
	markdowns: Set<string>
	read: (src: string) => string | undefined
}

export interface VirtualModule {
	id: string
	content: (this: Context & { id: string }) => string | PromiseLike<string>
}
