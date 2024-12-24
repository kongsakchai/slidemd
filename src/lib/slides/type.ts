export type Meta = { [key: string]: string };

export interface Extracted {
	body: string;
	meta?: Meta;
}

export interface Slide {
	htmls: string[];
	meta?: Meta;
}

export type HighlightRender = (code: string, lang: string, args: string) => string;

export type SlideRender = (markdown: string) => Slide;
