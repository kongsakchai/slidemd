import { createHighlighter as highlighter } from 'shiki';
import type { Highlighter } from './types';

const LANGS = ['javascript', 'typescript', 'js', 'ts', 'svelte', 'html', 'css', 'json', 'go', 'plaintext'];

const THEMES = {
	light: 'github-light',
	dark: 'github-dark',
};

const shiki = await highlighter({
	themes: Object.values(THEMES),
	langs: LANGS,
});

/**
 * @returns {Highlighter}
 * @description Creates a code highlighter
 */
export const createHighilighter = (): Highlighter => {
	return (code: string, lang: string, args: string) => {
		if (LANGS.includes(lang)) {
			return `<div class="language-${lang}">${shiki.codeToHtml(code, { lang: lang, themes: THEMES })}</div>`;
		}

		return shiki.codeToHtml(code, { lang: 'plaintext', themes: THEMES });
	};
};
