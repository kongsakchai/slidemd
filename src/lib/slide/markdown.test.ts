import { describe, expect, test } from 'vitest';
import { createMarkdown, extractFrontmatter } from './markdown';

describe('extractFrontmatter', () => {
	test('should extract frontmatter', () => {
		const markdown = `
---
title: Frontmatter
---
test frontmatter`;
		const expectedFrontmatter = { title: 'Frontmatter' };
		const expectedBody = 'test frontmatter';

		const { metadata, body } = extractFrontmatter(markdown);

		expect(metadata).toEqual(expectedFrontmatter);
		expect(body).toEqual(expectedBody);
	});

	test('should return empty frontmatter', () => {
		const markdown = 'test frontmatter';
		const expectedFrontmatter = {};
		const expectedBody = 'test frontmatter';

		const { metadata, body } = extractFrontmatter(markdown);

		expect(metadata).toEqual(expectedFrontmatter);
		expect(body).toEqual(expectedBody);
	});

	test('should extract frontmatter with multiple keys', () => {
		const markdown = `
---
title: Frontmatter
description: This is a test
---
test frontmatter`;
		const expectedFrontmatter = { title: 'Frontmatter', description: 'This is a test' };
		const expectedBody = 'test frontmatter';

		const { metadata, body } = extractFrontmatter(markdown);

		expect(metadata).toEqual(expectedFrontmatter);
		expect(body).toEqual(expectedBody);
	});

	test('should extract frontmatter with key containing colon', () => {
		const markdown = `
---
title: "Frontmatter: Test"
---
test frontmatter`;
		const expectedFrontmatter = { title: 'Frontmatter: Test' };
		const expectedBody = 'test frontmatter';

		const { metadata, body } = extractFrontmatter(markdown);

		expect(metadata).toEqual(expectedFrontmatter);
		expect(body).toEqual(expectedBody);
	});

	test('should extract frontmatter with array value', () => {
		const markdown = `
---
tags:
  - test
  - frontmatter
---
test frontmatter`;
		const expectedFrontmatter = { tags: ['test', 'frontmatter'] };
		const expectedBody = 'test frontmatter';

		const { metadata, body } = extractFrontmatter(markdown);

		expect(metadata).toEqual(expectedFrontmatter);
		expect(body).toEqual(expectedBody);
	});
});

describe('create markdown', () => {
	test('should create markdown', () => {
		const md = createMarkdown();
		expect(md).toBeDefined();
	});
});
