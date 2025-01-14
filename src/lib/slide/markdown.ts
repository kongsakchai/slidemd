import { alert } from '@mdit/plugin-alert';
import { attrs } from '@mdit/plugin-attrs';
import { tasklist } from '@mdit/plugin-tasklist';
import MarkdownIt from 'markdown-it';
import { createHighlighter } from './highlighter';
import { imageRender } from './image';

export const createMarkdown = (): MarkdownIt => {
	const md = new MarkdownIt({ html: true, breaks: true });
	md.use(attrs);
	md.use(tasklist, { disabled: false });
	md.use(alert, { alertNames: ['tip', 'warning', 'caution', 'important', 'note', 'bug', 'example', 'info'] });

	const highlighter = createHighlighter();
	md.use(highlighter.highlight);
	md.use(imageRender);
	md.use(fragmentRender);
	return md;
};

export const fragmentRender = (md: MarkdownIt) => {
	const originalListItem = md.renderer.rules.list_item_open;
	md.renderer.rules.list_item_open = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		if (token.markup === '*') {
			token.attrJoin('class', 'page-step');
			token.attrSet('data-step-active', 'false');
		}
		return originalListItem?.(tokens, idx, options, env, self) ?? self.renderToken(tokens, idx, options);
	};
};
