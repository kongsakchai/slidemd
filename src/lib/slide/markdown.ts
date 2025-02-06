import { alert } from '@mdit/plugin-alert';
import { attrs } from '@mdit/plugin-attrs';
import { tasklist } from '@mdit/plugin-tasklist';
import jsyaml from 'js-yaml';
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
	const match = /^[\r\n]?---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) {
		return { body: markdown, metadata: {} };
	}
	const metadata = jsyaml.load(match[1]);
	const body = markdown.slice(match[0].length).trim();

	return { body, metadata };
};
