import { createMarkdown } from './markdown';
import type { Extracted, Meta, Slide, SlideRender } from './type';

/**
 * @returns {Promise<SlideRender>}
 * @description Creates a slide renderer
 */
export const createRenderer = (): SlideRender => {
	const md = createMarkdown();

	return (markdown: string): Slide => {
		const { body, meta } = extractFrontmatter(markdown);
		const htmls = body.split('\n---\n').map((slide) => md.render(slide));
		return { htmls, meta };
	};
};

/**
 * @param {string} markdown
 * @returns {Extracted}
 * @description Extracts frontmatter from markdown
 */
export const extractFrontmatter = (markdown: string): Extracted => {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) return { body: markdown };

	const frontmatter = match[1];
	const body = markdown.slice(match[0].length);

	const meta = frontmatter.split('\n').reduce<Meta>((acc: Meta, line: string) => {
		const [key, value] = line.split(':').map((x) => x.trim());
		return { ...acc, [key]: value };
	}, {});

	return { body, meta };
};
