import { createMarkdown } from './markdown';

export const createSlideRenderer = () => {
	const md = createMarkdown();
	const render = (body: string, base?: string): string[] => {
		const env: Record<string, unknown> = { base };
		const slide = body.split('\n---\n').map((content) => {
			return md.render(content, env);
		});
		return slide;
	};

	return { render };
};

export const slideRenderer = createSlideRenderer();
