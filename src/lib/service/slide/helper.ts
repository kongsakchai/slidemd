import type { MarkdownData } from './types';

export const joinCodeAttrs = (attrs: [string, string][]) => {
	if (!attrs.length) return '';
	const mapAttrs = ([key, value]: [string, string]) => {
		if (key === 'class') {
			return `${key}="code-container ${value}"`;
		}
		return `${key}="${value}"`;
	};

	return attrs.map(mapAttrs).join(' ');
};

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
