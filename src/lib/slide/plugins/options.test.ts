import MarkdownIt from 'markdown-it';
import { describe, expect, test } from 'vitest';
import { extractPageOptions, pageOptions } from './options';

describe('extractPageOptions', () => {
	test('should empty when have not page options', () => {
		const content = '# test\n<!-- title: test -->';

		const result = extractPageOptions(content);
		expect(result).toEqual({});
	});

	test('should empty when have not content', () => {
		const content = '';

		const result = extractPageOptions(content);
		expect(result).toEqual({});
	});

	test('should extract page options', () => {
		const content = '# test\n<!-- @class: _ -->\n <!-- @paging: true -->\n <!-- @test: false -->';
		const expected = { class: '', paging: 'true' };

		const result = extractPageOptions(content);
		expect(result).toEqual(expected);
	});
});

describe('pageOption', () => {
	test('should return env when have page option in markdown', () => {
		const md = new MarkdownIt({ html: true }).use(pageOptions);
		const markdown = `# test\n<!-- @class: bg-red-500 -->\n 555555 \n <!-- @color: #ff00ff --> \n`;
		const env = {};
		const expected = { class: 'bg-red-500', color: '#ff00ff', page: 1 };

		md.render(markdown, env);
		expect(env).toEqual(expected);
	});
});
