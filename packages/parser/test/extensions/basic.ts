import { describe, expect } from 'vitest'

import { Parse, Testcase, runTest } from '../helper'

// reference from https://www.markdownguide.org/basic-syntax/
export function basicSyntaxTestcase(parse: Parse) {
	describe('header', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return one line',
				value: '# Header1',
				expected: '<h1>Header1</h1>'
			},
			{
				title: 'should return multiple line',
				value: '# Header1\n ## Header2',
				expected: '<h1>Header1</h1>\n<h2>Header2</h2>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('paragraph', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return one line',
				value: 'hello, markdown',
				expected: '<p>hello, markdown</p>'
			},
			{
				title: 'should return multiple line',
				value: 'hello, markdown\nhello, remark',
				expected: '<p>hello, markdown\nhello, remark</p>'
			},
			{
				title: 'should return multiple paragraph',
				value: 'hello, markdown\n\nhello, remark',
				expected: '<p>hello, markdown</p>\n<p>hello, remark</p>'
			},
			{
				title: 'should return bold',
				value: '**hello, markdown**',
				expected: '<p><strong>hello, markdown</strong></p>'
			},
			{
				title: 'should return italic',
				value: '*hello, markdown*',
				expected: '<p><em>hello, markdown</em></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('blockquote', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return one line',
				value: '>hello, markdown',
				expected: '<blockquote>\n<p>hello, markdown</p>\n</blockquote>'
			},
			{
				title: 'should return multiple line',
				value: '> hello, markdown\nhello, remark\n> hello, svelte',
				expected: '<blockquote>\n<p>hello, markdown\nhello, remark\nhello, svelte</p>\n</blockquote>'
			},
			{
				title: 'should return multiple line and paragraph',
				value: '> hello, markdown\n>\n>hello, remark',
				expected: '<blockquote>\n<p>hello, markdown</p>\n<p>hello, remark</p>\n</blockquote>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('order list', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return one line',
				value: '1. first items',
				expected: '<ol>\n<li>first items</li>\n</ol>'
			},
			{
				title: 'should return multiple line',
				value: '1. first items\n2.invalid fromat\n2. second items',
				expected: '<ol>\n<li>first items\n2.invalid fromat</li>\n<li>second items</li>\n</ol>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('unorder list', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return one line',
				value: '- first items',
				expected: '<ul>\n<li>first items</li>\n</ul>'
			},
			{
				title: 'should return multiple line',
				value: '- first items\n-invalid fromat\n- second items',
				expected: '<ul>\n<li>first items\n-invalid fromat</li>\n<li>second items</li>\n</ul>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('code', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return code',
				value: '`hello, markdown`',
				expected: '<p><code>hello, markdown</code></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('horizontal line', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return horizontal line',
				value: '---',
				expected: '<hr>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('link', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return one line',
				value: '[title](https://www.example.com)',
				expected: '<p><a href="https://www.example.com">title</a></p>'
			},
			{
				title: 'should return multiple line',
				value: '[title](https://www.example.com)\n[title](https://www.example.com)',
				expected:
					'<p><a href="https://www.example.com">title</a>\n<a href="https://www.example.com">title</a></p>'
			},
			{
				title: 'should return quickly',
				value: '<https://www.example.com>',
				expected: '<p><a href="https://www.example.com">https://www.example.com</a></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('image', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return one line',
				value: '![alt](https://www.example.com "title")',
				expected: '<p><img src="https://www.example.com" alt="alt" title="title"></p>'
			},
			{
				title: 'should return multiple line',
				value: '![alt](https://www.example.com)\n![alt](https://www.example.com)',
				expected:
					'<p><img src="https://www.example.com" alt="alt">\n<img src="https://www.example.com" alt="alt"></p>'
			},
			{
				title: 'should return multiple line and paragraph',
				value: '![alt](https://www.example.com)\n\n![alt](https://www.example.com)',
				expected:
					'<p><img src="https://www.example.com" alt="alt"></p>\n<p><img src="https://www.example.com" alt="alt"></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})
}
