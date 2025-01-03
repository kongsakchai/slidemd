import { createHighlighter } from './highlighter';
import { createMarkdown } from './markdown';
import type { MarkdownData, Slide, SlideRenderer } from './types';

export const extractFrontmatter = (markdown: string): MarkdownData => {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) return { body: markdown, meta: {} };

	const frontmatter = match[1];
	const body = markdown.slice(match[0].length);

	const meta = frontmatter.split('\n').reduce((acc, line) => {
		const [key, value] = line.split(':').map((x) => x.trim());
		return { ...acc, [key]: value };
	}, {});

	return { body, meta };
};

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
