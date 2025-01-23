import type { PluginSimple } from 'markdown-it';

export const pageStep: PluginSimple = (md) => {
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

export const paging: PluginSimple = (md) => {
	md.core.ruler.push('paging', (state) => {
		if (!state.env.paging || state.env.paging === 'skip' || state.env.paging === 'false') {
			return;
		}

		const token = new state.Token('html_block', '', 0);
		token.content = `<div class="paginate">${state.env.page}</div>`;
		state.tokens.push(token);
	});
};
