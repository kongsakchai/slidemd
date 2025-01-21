import { transformerNotationDiff, transformerNotationFocus, transformerNotationHighlight } from '@shikijs/transformers';
import type { PluginSimple } from 'markdown-it';
import { createHighlighter as createShikiHighlighter } from 'shiki';
import { joinAttrs, LANGUAGES, THEMES } from './utils';

const shiki = await createShikiHighlighter({ langs: LANGUAGES, themes: Object.values(THEMES) });

export const createHighlighter = () => {
	const transformers = [transformerNotationDiff(), transformerNotationHighlight(), transformerNotationFocus()];
	const codeToHtml = (code: string, lang: string) => shiki.codeToHtml(code, { lang, themes: THEMES, transformers });

	const highlight: PluginSimple = (md) => {
		md.renderer.rules.fence = (tokens, idx) => {
			const token = tokens[idx];
			const code = token.content.trim();

			let attrs = '';
			if (token.attrs && token.attrs.length > 0) {
				token.attrJoin('class', 'code-container');
				attrs = joinAttrs(token.attrs);
			}

			let lang = token.info.trim();
			if (lang === 'mermaid') {
				return mermaid(code, attrs);
			}
			if (!LANGUAGES.includes(lang)) {
				lang = 'plaintext';
			}

			const html = codeToHtml(code, lang);
			return codeblock(html, lang, attrs);
		};
	};

	return { highlight };
};

const codeblock = (code: string, lang: string, attrs: string) => {
	const block = `
        <div class="language-${lang}">
            <span class="lang">${lang}</span>
            <button class="copy-code">Copy</button>
            ${code}
        </div>
    `;

	return attrs ? `<div ${attrs}>${block}</div>` : block;
};

const mermaid = (code: string, attrs: string) => {
	return `
    <div ${attrs}>
        <div class="mermaid">
            ${code}
        </div>
    </div>`;
};
