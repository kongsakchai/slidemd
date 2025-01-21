import type { PluginSimple } from 'markdown-it';
import type { Token } from 'markdown-it/index.js';

const filterCommentContent = (token: Token) => {
	return token.content.startsWith('<!--') && token.content.endsWith('-->\n');
};

const filterHTMLToken = (token: Token) => {
	return token.type === 'html_block';
};

const filterHTMLComentToken = (token: Token) => {
	return filterHTMLToken(token) && filterCommentContent(token);
};

const OPTIONS_KEYWORD = ['paging', '_paging', 'class', '_class', 'style', '_style'];

export const pageOptions: PluginSimple = (md) => {
	md.core.ruler.push('pageOptions', (state) => {
		const header = state.env.header;
		const htmlToken = state.tokens.filter(filterHTMLComentToken);

		const options: Record<string, string> = htmlToken.reduce((prev, token) => {
			const options = extractPageOptions(token.content || '');
			return { ...prev, ...options };
		}, {});

		state.env.paging = options._paging ?? options.paging ?? header.paging;
		state.env.page = calcPaging(state.env.paging, state.env.page);
		if (options.paging !== undefined) {
			header.paging = options.paging;
		}

		state.env.class = options._class ?? options.class ?? header.class;
		if (options.class !== undefined) {
			header.class = options.class;
		}

		state.env.style = options._style ?? options.style ?? header.style;
		if (options.style !== undefined) {
			header.style = options.style;
		}
	});
};

export const extractPageOptions = (content: string) => {
	const options = /<!--\s*@([^:]+):([\s\S]+)\s*-->/g.exec(content);
	if (!options) {
		return {};
	}

	const key = options[1].trim();
	const value = options[2].trim() == '_' ? '' : options[2].trim();
	if (!OPTIONS_KEYWORD.includes(key)) {
		return {};
	}

	return { [key]: value };
};

const calcPaging = (paging?: string, page: number = 0) => {
	switch (paging) {
		case 'skip':
			return page;
		case 'hold':
			return page;
		default:
			return page + 1;
	}
};
