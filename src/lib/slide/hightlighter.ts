import type { PluginSimple } from 'markdown-it';
import { createHighlighter as createShikiHighlighter } from 'shiki';

const THEMES = { light: 'github-light', dark: 'github-dark' };
const LANGUAGES = ['javascript', 'typescript', 'js', 'svelte', 'ts', 'html', 'css', 'json', 'go', 'plaintext'];

export const createHighlighter = async () => {
	const { codeToHtml } = await createShikiHighlighter({ langs: LANGUAGES, themes: Object.values(THEMES) });

	const highlight: PluginSimple = (md) => {
		md.renderer.rules.fence = (tokens, idx) => {
			const token = tokens[idx];
			const code = token.content.trim();
			const lang = token.info.trim();
			const attr = joinAttrs(token.attrs || []);

			if (LANGUAGES.includes(lang)) {
				const html = codeToHtml(code, { lang, themes: THEMES });
				return codeblock(html, lang, attr);
			}

			if (lang === 'mermaid') {
				return mermaid(code, attr);
			}

			const html = codeToHtml(code, { lang: 'plaintext', themes: THEMES });
			return codeblock(html, 'plaintext', attr);
		};
	};

	return { highlight };
};

const joinAttrs = (attrs: [string, string][]) => {
	return attrs.map(([key, value]) => `${key}="${value}"`).join(' ');
};

const codeblock = (code: string, lang: string, attrs: string) => {
	return `<div ${attrs}><div class="language-${lang}">${code}</div></div>`;
};

const mermaid = (code: string, attrs: string) => {
	return `<div ${attrs}><div class="mermaid">${code}</div></div>`;
};
