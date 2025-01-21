import { alert } from '@mdit/plugin-alert';
import { attrs } from '@mdit/plugin-attrs';
import { tasklist } from '@mdit/plugin-tasklist';
import MarkdownIt from 'markdown-it';
import { createHighlighter } from './highlighter';
import { enhancedImage } from './image';
import { pageOptions } from './options';

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

const pageStep = (md: MarkdownIt) => {
	const originalListItem = md.renderer.rules.list_item_open;
	md.renderer.rules.list_item_open = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		if (token.markup === '*') {
			token.attrJoin('class', 'page-step');
			token.attrSet('data-step-active', 'true');
		}
		return originalListItem?.(tokens, idx, options, env, self) ?? self.renderToken(tokens, idx, options);
	};
};

const paging = (md: MarkdownIt) => {
	md.core.ruler.push('paging', (state) => {
		if (!state.env.paging || state.env.paging === 'skip' || state.env.paging === 'false') {
			return;
		}

		const token = new state.Token('html_block', '', 0);
		token.content = `<div class="paginate">${state.env.page}</div>`;
		state.tokens.push(token);
	});
};
