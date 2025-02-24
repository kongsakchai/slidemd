import type { PluginSimple } from 'markdown-it';
import { OPTIONS_KEY, PREFIX_LOCAL_KEY } from '../constants';
import type { PageOptionRule } from '../types';
import { filterHTMLComentToken, isGlobalOption, isLocalOption } from './helper';
import { pageRule } from './rule_options/page';

export const rules: Record<string, PageOptionRule> = {};

export const pageOptions: PluginSimple = (md) => {
	rules.page = pageRule;

	md.core.ruler.push('pageOptions', (state) => {
		const header = state.env.header || {};
		const htmlToken = state.tokens.filter(filterHTMLComentToken);

		const options: Record<string, string> = htmlToken.reduce((prev, token) => {
			const options = extractPageOptions(token.content);
			return { ...prev, ...options };
		}, {});

		for (const key of OPTIONS_KEY) {
			const localKey = PREFIX_LOCAL_KEY + key;
			const val = options[localKey] ?? options[key] ?? header[key];
			if (val != undefined) {
				state.env[key] = val;
			}
			if (options[key] != undefined) {
				header[key] = options[key];
			}
		}

		for (const key in rules) {
			state.env[key] = rules[key](state.env[key], state);
		}
	});
};

export const extractPageOptions = (content: string) => {
	const regxs = content.matchAll(/<!--\s*@([^:]+):([\s\S]+?)\s*-->/g);
	const options = Array.from(regxs, regxToPageOptions);

	return options.reduce((prev, curr) => ({ ...prev, ...curr }), {});
};

const regxToPageOptions = (regx: RegExpExecArray) => {
	const key = regx[1].trim();
	const value = regx[2].trim() == '_' ? '' : regx[2].trim();
	if (isLocalOption(key) || isGlobalOption(key)) {
		return { [key]: value };
	}

	return {};
};
