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
	const originalBulletList = md.renderer.rules.bullet_list_open;
	md.renderer.rules.bullet_list_open = (tokens, idx, options, env, self) => {
		env.fragmentIndex = 0;
		return originalBulletList?.(tokens, idx, options, env, self) || self.renderToken(tokens, idx, options);
	};

	const originalListItem = md.renderer.rules.list_item_open;
	md.renderer.rules.list_item_open = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		env.fragmentIndex = env.fragmentIndex + 1;
		if (token.markup === '*') {
			token.attrJoin('class', 'fragment');
			token.attrSet('data-fragment-index', env.fragmentIndex.toString());
			token.attrSet('data-fragment-active', 'false');
		}
		return originalListItem?.(tokens, idx, options, env, self) || self.renderToken(tokens, idx, options);
	};
};
