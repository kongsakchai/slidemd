import type { Token } from 'markdown-it/index.js';
import { isAbsolute, join } from 'path';

export const THEMES = { light: 'github-light', dark: 'github-dark' };

export const LANGUAGES = [
	'javascript',
	'typescript',
	'js',
	'svelte',
	'ts',
	'html',
	'css',
	'json',
	'go',
	'bash',
	'sh',
	'yaml',
	'dockerfile',
	'makefile',
	'plaintext'
];

export const OPTIONS_KEY = ['paging', 'class', 'style', 'color'];

export const PREFIX_LOCAL_KEY = '_';

export const resolveAssetUrl = (src: string, base?: string): string => {
	const absolute = isAbsolute(src);
	const path = base && !absolute ? join(base, src) : src;
	try {
		new URL(src);
		return src;
	} catch {
		return `/assets/${btoa(path)}`;
	}
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

export const extractFrontmatter = (markdown: string) => {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) {
		return { body: markdown, metadata: {} };
	}
	const frontmatter = match[1];
	const body = markdown.slice(match[0].length);
	const metadata = frontmatter.split('\n').reduce((acc, line) => {
		const [key, value] = line.split(':').map((x) => x.trim());
		return { ...acc, [key]: value };
	}, {});

	return { body, metadata };
};

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
	return token.content.startsWith('<!--') && token.content.endsWith('-->\n');
};

export const filterHTMLToken = (token: Token) => {
	return token.type === 'html_block';
};

export const filterHTMLComentToken = (token: Token) => {
	return filterHTMLToken(token) && filterCommentContent(token);
};

export const isLocalOption = (key: string) => {
	return key.startsWith(PREFIX_LOCAL_KEY) && isGlobalOption(key.slice(1));
};

export const isGlobalOption = (key: string) => {
	return OPTIONS_KEY.includes(key);
};

export const removeChildrenToken = (token: Token, children: Token) => {
	const index = token.children?.indexOf(children);
	if (index != undefined && index >= 0) {
		token.children?.splice(index, 1);
	}
};

export const removeToken = (state: Token[], token: Token) => {
	const index = state.indexOf(token);
	if (index && index >= 0) {
		state.splice(index - 1, 3);
	}
};
