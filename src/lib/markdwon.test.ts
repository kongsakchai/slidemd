import { describe, expect, test } from 'vitest'
import { extractFrontmatter, markdownToPage, markdownToSlide } from './markdown'

describe('extractFrontmatter', () => {
	test('should extract frontmatter and body', () => {
		const markdown = `---
title: Test Slide
author: John Doe
---
# Slide Content`

		const result = extractFrontmatter(markdown)
		expect(result.metadata).toEqual({
			title: 'Test Slide',
			author: 'John Doe'
		})
		expect(result.body).toEqual('\n# Slide Content')
	})

	test('should return body only when no frontmatter', () => {
		const markdown = '# Slide Content'
		const result = extractFrontmatter(markdown)
		expect(result.metadata).toEqual({})
		expect(result.body).toEqual('# Slide Content')
	})
})

describe('markdownToPage', () => {
	test('should convert markdown to HTML and extract directives', async () => {
		const markdown = '# Header'

		const result = await markdownToPage(markdown, {})

		expect(result.html).toContain('<h1>Header</h1>')
		expect(result.directive).toEqual({
			global: {},
			local: {}
		})
		expect(result.split).toBe(false)
	})
})

describe('markdownToSlide', () => {
	test('should convert markdown with frontmatter to Slide', async () => {
		const markdown = `
---
title: Test Slide
author: John Doe
---
# Slide Content`

		const expected = {
			pages: [
				{
					html: '<h1>Slide Content</h1>',
					directive: {
						title: 'Test Slide',
						author: 'John Doe'
					}
				}
			],
			properties: {
				title: 'Test Slide',
				author: 'John Doe'
			}
		}

		const result = await markdownToSlide(markdown)
		expect(result).toEqual(expected)
	})
})
