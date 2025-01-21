import { createMarkdown } from './markdown';
import type { Slide, SlideEnv } from './types';

export const createSlideRenderer = () => {
	const md = createMarkdown();
	const render = (body: string, base?: string, header?: SlideEnv): Slide[] => {
		const env: SlideEnv = { base: base, page: 0, header: header };
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
