export interface Context {
	root: string
	markdowns: string[]
	read: (src: string) => string | undefined
}

export interface Module {
	id: string
	content: (this: Module, ctx: Context) => void
}
