import type { PluginSimple } from 'markdown-it';
import type { SlideEnv } from './types';
import { filterHTMLComentToken, isGlobalOption, isLocalOption, OPTIONS_KEY, PREFIX_LOCAL_KEY } from './utils';

export const pageOptions: PluginSimple = (md) => {
	md.core.ruler.push('pageOptions', (state) => {
		const header = state.env.header;
		const htmlToken = state.tokens.filter(filterHTMLComentToken);

		const options: Record<string, string> = htmlToken.reduce((prev, token) => {
			const options = extractPageOptions(token.content || '');
			return { ...prev, ...options };
		}, {});

		for (const key of OPTIONS_KEY) {
			const localKey = PREFIX_LOCAL_KEY + key;
			state.env[key] = options[localKey] ?? options[key] ?? header[key];
			if (options[key] != undefined) {
				header[key] = options[key];
			}
		}

		state.env.page = calcPaging(state.env);
	});
};

const extractPageOptions = (content: string) => {
	const options = /<!--\s*@([^:]+):([\s\S]+)\s*-->/g.exec(content);
	if (!options) {
		return {};
	}

	const key = options[1].trim();
	const value = options[2].trim() == '_' ? '' : options[2].trim();
	if (isLocalOption(key) || isGlobalOption(key)) {
		return { [key]: value };
	}

	return {};
};

const calcPaging = (env: SlideEnv) => {
	switch (env.paging) {
		case 'skip':
			return env.page;
		case 'hold':
			return env.page;
		default:
			return env.page + 1;
	}
};
