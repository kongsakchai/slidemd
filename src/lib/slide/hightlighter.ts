import { createHighlighter as createShikiHighlighter } from 'shiki';

const THEMES = { light: 'github-light', dark: 'github-dark' };
const LANGUAGES = ['javascript', 'typescript', 'js', 'svelte', 'ts', 'html', 'css', 'json', 'go', 'plaintext'];

export const createHighlighter = async () => {
	const { codeToHtml } = await createShikiHighlighter({ langs: LANGUAGES, themes: Object.values(THEMES) });

	const highlight = (code: string, lang: string) => {
		const language = LANGUAGES.includes(lang) ? lang : 'plaintext';
		return codeToHtml(code, { lang: language, theme: THEMES.light });
	};

	return { highlight };
};
