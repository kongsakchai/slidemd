import { createMarkdown } from './markdown';

export interface Slide {
	content: string;
	page?: number;
	paging?: string;
	class?: string;
	style?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Envariable = Record<string, any>;

export const createSlideRenderer = () => {
	const md = createMarkdown();
	const render = (body: string, base?: string, header?: Envariable): Slide[] => {
		const env: Envariable = { base: base, page: 0, header: header };
		const slide = body.split('\n---\n').map((content) => {
			const html = md.render(content, env);
			return {
				content: html,
				page: env.page,
				paging: env.paging,
				class: env.class,
				style: env.style
			};
		});
		return slide;
	};

	return { render };
};

export const slideRenderer = createSlideRenderer();
