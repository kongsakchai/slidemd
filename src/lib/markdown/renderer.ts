import { attrs } from '@mdit/plugin-attrs';
import { tasklist } from '@mdit/plugin-tasklist';
import MarkdownIt from 'markdown-it';
import type { Extracted, Meta, Slide } from './type';

const md = new MarkdownIt({ html: true });
md.use(tasklist, { disabled: false });
md.use(attrs);

/**
 * @param {string} markdown
 * @returns {string[]}
 * @description Renders markdown slides
 */
export const renderSlide = (markdown: string): string[] => {
	const slides = markdown.split('\n---\n');
	return slides.map((content) => md.render(content));
};

/**
 * @param {string} markdown
 * @returns {Slide}
 * @description Converts markdown to slides
 */
export const markdownToSlide = (markdown: string): Slide => {
	const { body, meta } = extractFrontmatter(markdown);
	const slides = renderSlide(body);
	return { htmls: slides, meta };
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
