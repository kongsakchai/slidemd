import { createMarkdown } from './markdown';

export interface Slide {
	content: string;
	page: number;
	paging: string;
	step: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Envariable = Record<string, any>;

export const createSlideRenderer = () => {
	const md = createMarkdown();
	const render = (body: string, base?: string, header?: Envariable): Slide[] => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const env: Envariable = { base: base, page: 0, header: header };
		const slide = body.split('\n---\n').map((content) => {
			env.step = 0;
			const html = md.render(content, env);
			return { content: html, page: env.page, paging: env.paging, step: env.step };
		});
		return slide;
	};

	return { render };
};

export const slideRenderer = createSlideRenderer();
