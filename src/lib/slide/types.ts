export interface MetaData {
	[key: string]: string;
}

export interface Slide {
	pages: string[];
	meta: MetaData;
}
