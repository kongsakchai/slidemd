/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Slide {
	content: string;
	page?: number;
	paging?: string;
	class?: string;
	style?: string;
}

export type SlideEnv = Record<string, any>;
