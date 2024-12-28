import { createMarkdown } from './markdown';
import type { MarkdownData, Slide } from './types';

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

export const createSlideRenderer = () => {
	const md = createMarkdown();

	const render = (markdown: string): Slide => {
		const { body, meta } = extractFrontmatter(markdown);
		const pages = body.split('\n---\n').map((content) => {
			return md.render(content);
		});
		return { pages, meta };
	};

	return { render };
};

export const slideRenderer = createSlideRenderer();
