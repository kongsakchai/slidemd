export interface MetaData {
	[key: string]: string;
}

export interface Slide {
	pages: string[];
	meta: MetaData;
}

export interface MarkdownData {
	body: string;
	meta: MetaData;
}

export interface SlideRenderer {
	render: (markdown: string) => Slide;
}

export type Highlighter = (code: string, lang: string, attrs: string) => string;
