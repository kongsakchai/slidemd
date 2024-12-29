import { alert } from '@mdit/plugin-alert';
import { attrs } from '@mdit/plugin-attrs';
import { tasklist } from '@mdit/plugin-tasklist';
import MarkdownIt from 'markdown-it';
import type { Highlighter } from './types';

export const createMarkdown = (highlight?: Highlighter): MarkdownIt => {
	const md = MarkdownIt({ html: true, highlight: highlight });
	md.use(attrs);
	md.use(tasklist, { disabled: false });
	md.use(alert, { alertNames: ['tip', 'warning', 'caution', 'important', 'note', 'bug', 'example', 'info'] });
	return md;
};
