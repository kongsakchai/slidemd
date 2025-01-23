import { alert } from '@mdit/plugin-alert';
import { attrs } from '@mdit/plugin-attrs';
import { tasklist } from '@mdit/plugin-tasklist';
import MarkdownIt from 'markdown-it';
import { createHighlighter } from './plugins/highlighter';
import { enhancedImage } from './plugins/image';
import { pageOptions } from './plugins/options';
import { pageStep, paging } from './plugins/page';

export const createMarkdown = (): MarkdownIt => {
	const md = new MarkdownIt({ html: true, breaks: true });
	md.use(attrs, { left: '<!--', right: '-->' });
	md.use(tasklist, { disabled: false });
	md.use(alert, { alertNames: ['tip', 'warning', 'caution', 'important', 'note', 'bug', 'example', 'info'] });

	const highlighter = createHighlighter();
	md.use(highlighter.highlight);
	md.use(enhancedImage);
	md.use(pageOptions);
	md.use(pageStep);
	md.use(paging);
	return md;
};

export const extractFrontmatter = (markdown: string) => {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) {
		return { body: markdown, metadata: {} };
	}
	const frontmatter = match[1];
	const body = markdown.slice(match[0].length);
	const metadata = frontmatter.split('\n').reduce((acc, line) => {
		const [key, value] = line.split(':').map((x) => x.trim());
		return { ...acc, [key]: value };
	}, {});

	return { body, metadata };
};
