export type Meta = { [key: string]: string };

export interface Extracted {
	body: string;
	meta?: Meta;
}

export interface Slide {
	htmls: string[];
	meta?: Meta;
}

export type Highlighter = (code: string, lang: string, args: string) => string;

export interface SlideRenderer {
	render: (markdown: string) => Slide;
}
