import type { StateCore } from 'markdown-it/index.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Slide {
	content: string;
	page?: number;
	paging?: string;
	class?: string;
	style?: string;
}

export type SlideEnv = Record<string, any>;

export type PageOptionRule = (value: any, state: StateCore) => any;
