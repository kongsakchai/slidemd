import type { Token } from 'markdown-it/index.js';
import { isAbsolute, join } from 'path';
import { OPTIONS_KEY, PREFIX_LOCAL_KEY } from '../constants';

export const filterImageToken = (token: Token) => {
	return token.type === 'image';
};

export const filterInlineToken = (token: Token) => {
	return token.type === 'inline';
};

export const filterInlineImageToken = (token: Token) => {
	return filterInlineToken(token) && token.children?.some(filterImageToken);
};

export const filterCommentContent = (token: Token) => {
	return /<!--\s*([\s\S]+?)\s*-->/g.test(token.content);
};

export const filterHTMLToken = (token: Token) => {
	return token.type === 'html_block';
};

export const filterHTMLComentToken = (token: Token) => {
	return filterHTMLToken(token) && filterCommentContent(token);
};

export const removeChildrenToken = (token: Token, children: Token) => {
	const index = token.children?.indexOf(children);
	if (index != undefined && index >= 0) {
		token.children?.splice(index, 1);
	}
};

export const removeToken = (state: Token[], token: Token) => {
	const index = state.indexOf(token);
	if (index >= 0) {
		state.splice(index, 1);
	}
};

export const clearEmptyParagraphToken = (state: Token[]) => {
	state.forEach((token, i) => {
		if (token.type === 'paragraph_open' && state[i + 1].type === 'paragraph_close') {
			state.splice(i, 2);
		}
	});
};

export const isLocalOption = (key: string) => {
	return key.startsWith(PREFIX_LOCAL_KEY) && isGlobalOption(key.slice(1));
};

export const isGlobalOption = (key: string) => {
	return OPTIONS_KEY.includes(key);
};

export const joinAttrs = (attrs: [string, string][] | null) => {
	if (!attrs || attrs.length == 0) {
		return '';
	}
	return attrs
		.filter(([, value]) => value)
		.map(([key, value]) => `${key}="${value}"`)
		.join(' ');
};

export const resolveAssetUrl = (src: string, base?: string): string => {
	try {
		new URL(src);
		return src;
	} catch {
		const absolute = isAbsolute(src);
		const path = base && !absolute ? join(base, src) : src;
		return `/assets/${btoa(path.trim())}`;
	}
};
