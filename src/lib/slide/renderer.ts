import { createMarkdown } from './markdown';

export interface Slide {
	content: string;
}

export const createSlideRenderer = () => {
	const md = createMarkdown();
	const render = (body: string, base?: string): Slide[] => {
		const env = { base: base };
		const slide = body.split('\n---\n').map((content) => {
			const html = md.render(content, env);
			return { content: html };
		});
		return slide;
	};

	return { render };
};

export const slideRenderer = createSlideRenderer();
