import { alert } from '@mdit/plugin-alert';
import { attrs } from '@mdit/plugin-attrs';
import { tasklist } from '@mdit/plugin-tasklist';
import MarkdownIt from 'markdown-it';
import { createHighilighter } from './hightlight';

/**
 * @returns {MarkdownIt}
 * @description Creates a markdown renderer
 */
export const createMarkdown = (): MarkdownIt => {
	const highlighter = createHighilighter();
	const md = MarkdownIt({ html: true, highlight: highlighter });

	md.use(tasklist, { disabled: false });
	md.use(attrs);
	md.use(alert, { alertNames: ['tip', 'warning', 'caution', 'important', 'note', 'bug', 'example', 'info'] });

	return md;
};
