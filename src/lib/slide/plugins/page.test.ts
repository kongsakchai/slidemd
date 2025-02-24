import MarkdownIt from 'markdown-it';
import { describe, expect, test } from 'vitest';
import { pageStep, paging } from './page';

describe('page step plugin', () => {
	test('should add page-step class to list item', () => {
		const markdown = `* item`;
		const expected = `<li class="page-step" data-step-active="true">item</li>`;
		const md = MarkdownIt().use(pageStep);

		const result = md.render(markdown);
		expect(result).toContain(expected);
	});

	test('should not add page-step class to list item if not a bullet list', () => {
		const markdown = `- item`;
		const expected = `<li>item</li>`;
		const md = MarkdownIt().use(pageStep);

		const result = md.render(markdown);
		expect(result).toContain(expected);
	});
});

describe('paging plugin', () => {
	test('should add paginate div', () => {
		const markdown = `# Slide 1`;
		const expected = `<div class="paginate">1</div>`;
		const md = MarkdownIt().use(paging);

		const result = md.render(markdown, { paging: 'true', page: 1 });
		expect(result).toContain(expected);
	});

	test('should not add paginate div if paging is false', () => {
		const markdown = `# Slide 1`;
		const md = MarkdownIt().use(paging);

		const result = md.render(markdown, { paging: 'false', page: 1 });
		expect(result).not.toContain('paginate');
	});
});
