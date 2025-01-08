import { createHighlighter } from './highlighter';
import { imageRender } from './image';
import { createMarkdown } from './markdown';

export const createSlideRenderer = () => {
	const md = createMarkdown();
	const highlighter = createHighlighter();
	md.use(highlighter.highlight);
	md.use(imageRender);

	const render = (body: string): string[] => {
		const slide = body.split('\n---\n').map((content) => {
			return md.render(content);
		});
		return slide;
	};

	return { render };
};

export const slideRenderer = createSlideRenderer();
