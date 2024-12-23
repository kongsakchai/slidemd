export type Meta = { [key: string]: string };

export interface Extracted {
	body: string;
	meta?: Meta;
}

export interface Slide {
	htmls: string[];
	meta?: Meta;
}
