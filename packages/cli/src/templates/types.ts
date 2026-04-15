export interface TemplateOptions {
	root: string
	markdowns: string[]
	themes: string[]
	getSlideId: (this: TemplateOptions, layoutId: string) => string
	read: (this: TemplateOptions, slideId: string) => string
}

export interface Template {
	id: string
	getContent: (this: Template, options: TemplateOptions) => Promise<string> | string
}
