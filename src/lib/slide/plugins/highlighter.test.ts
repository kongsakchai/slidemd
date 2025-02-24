import { attrs } from '@mdit/plugin-attrs';
import MarkdownIt from 'markdown-it';
import { describe, expect, test } from 'vitest';
import { createHighlighter } from './highlighter';

describe('highlighter', () => {
	test('should highlight the code', () => {
		const highlighter = createHighlighter();
		const md = new MarkdownIt().use(highlighter.highlight);
		const code = '```typescript\nconst a = 1;\n```';
		const expected = `
<div class="language-typescript">
    <span class="lang">typescript</span>
    <button class="copy-code">Copy</button>`;

		const actual = md.render(code);
		expect(actual).include(expected);
	});

	test('should highlight the code with unknow language', () => {
		const highlighter = createHighlighter();
		const md = new MarkdownIt().use(highlighter.highlight);
		const code = '```unknown\nconst a = 1;\n```';
		const expected = `
<div class="language-plaintext">
    <span class="lang">plaintext</span>
    <button class="copy-code">Copy</button>`;

		const actual = md.render(code);
		expect(actual).include(expected);
	});

	test('should highlight the code with attributes', () => {
		const highlighter = createHighlighter();
		const md = new MarkdownIt().use(highlighter.highlight).use(attrs);
		const code = '```typescript { .bg-red-500 }\nconst a = 1;\n```';
		const expected = `<div class="bg-red-500 code-container">
<div class="language-typescript">
    <span class="lang">typescript</span>
    <button class="copy-code">Copy</button>`;

		const actual = md.render(code);
		expect(actual).include(expected);
	});

	test('should render mermaid code', () => {
		const highlighter = createHighlighter();
		const md = new MarkdownIt().use(highlighter.highlight);
		const code = '```mermaid\ngraph TD\n    A --> B\n```';
		const expected = `
<div >
    <div class="mermaid">
        graph TD
    A --> B
    </div>
</div>`;

		const actual = md.render(code);
		expect(actual).equal(expected);
	});

	test('should render mermaid code with attributes', () => {
		const highlighter = createHighlighter();
		const md = new MarkdownIt().use(highlighter.highlight).use(attrs);
		const code = '```mermaid { .bg-red-500 }\ngraph TD\n    A --> B\n```';
		const expected = `
<div class="bg-red-500 code-container">
    <div class="mermaid">
        graph TD
    A --> B
    </div>
</div>`;

		const actual = md.render(code);
		expect(actual).equal(expected);
	});
});
