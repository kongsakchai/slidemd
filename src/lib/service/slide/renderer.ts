import { extractFrontmatter } from './helper';
import { createHighlighter } from './highlighter';
import { createMarkdown } from './markdown';
import type { Slide, SlideRenderer } from './types';

let slideRenderer: SlideRenderer | null = null;

export const createSlideRenderer = async () => {
	if (slideRenderer) return slideRenderer;

	const md = createMarkdown();
	const highlighter = await createHighlighter();
	md.use(highlighter.highlight);

	const render = (markdown: string): Slide => {
		const { body, meta } = extractFrontmatter(markdown);
		const pages = body.split('\n---\n').map((content) => {
			return md.render(content);
		});
		return { pages, meta };
	};

	slideRenderer = { render };
	return slideRenderer;
};
