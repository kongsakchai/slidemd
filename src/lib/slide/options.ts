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

const OPTIONS_KEYWORD = ['paging', '_paging'];

export const pageOptions: PluginSimple = (md) => {
	md.core.ruler.push('pageOptions', (state) => {
		const header = state.env.header;
		const htmlToken = state.tokens.filter(filterHTMLComentToken);

		const options: Record<string, string> = htmlToken.reduce((prev, token) => {
			const options = extractPageOptions(token.content || '');
			return { ...prev, ...options };
		}, {});

		state.env.paging = options._paging || options.paging || header.paging;
		state.env.page = calcPaging(state.env.paging, state.env.page);
		if (options.paging) {
			header.paging = options.paging;
		}
	});
};

export const extractPageOptions = (content: string) => {
	const options = content.match(/<!--\s*([^:]+):([^:]+)\s*-->/g);
	if (!options) {
		return {};
	}

	const result: Record<string, string> = {};
	options.forEach((option) => {
		const [key, value] = option
			.replace('<!--', '')
			.replace('-->', '')
			.split(':')
			.map((v) => v.trim());
		if (OPTIONS_KEYWORD.includes(key)) {
			result[key] = value;
		}
	});

	return result;
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
