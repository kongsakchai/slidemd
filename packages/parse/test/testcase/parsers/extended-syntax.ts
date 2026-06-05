import { describe, expect } from 'vitest'

import { Testcase, runTest } from '../../helper'

type Parse = (str: string) => Promise<string>

export function extendedSyntaxTestcase(parse: Parse) {
	describe('table', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return table',
				value: '| Col 1 | Col 2 |\n| - | - |',
				expected: '<table>\n<thead>\n<tr>\n<th>Col 1</th>\n<th>Col 2</th>\n</tr>\n</thead>\n</table>'
			},
			{
				title: 'should return table with align',
				value: '| Col 1 | Col 2 |\n| -: | :-: |',
				expected:
					'<table>\n<thead>\n<tr>\n<th align="right">Col 1</th>\n<th align="center">Col 2</th>\n</tr>\n</thead>\n</table>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('fenced code blocks', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return without lang',
				value: '```\nconsole.log("hello, markdown")\n````',
				expected: '<pre><code>console.log("hello, markdown")\n</code></pre>'
			},
			{
				title: 'should return with lang',
				value: '```js\nconsole.log("hello, markdown")\n````',
				expected: '<pre><code class="language-js">console.log("hello, markdown")\n</code></pre>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('task list', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return paragraph when wrong format',
				value: '-[] first items\n- [] second items',
				expected: '<p>-[] first items</p>\n<ul>\n<li>[] second items</li>\n</ul>'
			},
			{
				title: 'should return task list',
				value: '- [ ] first items\n- [x] second items',
				expected:
					'<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled> first items</li>\n<li class="task-list-item"><input type="checkbox" checked disabled> second items</li>\n</ul>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('footnote', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return footnote',
				value: 'Hello, markdown[^1]\n\n[^1]: Hello, markdown.',
				expected:
					'<p>Hello, markdown<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).include(t.expected)
		})
	})

	describe('strikethrough', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return strikethrough',
				value: '~~strikethrough text~~ normal text',
				expected: '<p><del>strikethrough text</del> normal text</p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('emoji', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return emoji',
				value: ':tada: :rocket: :seedling:',
				expected: '<p>🎉 🚀 🌱</p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('highlight', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return highlight',
				value: 'hello, ==markdown==',
				expected: '<p>hello, <mark>markdown</mark></p>'
			},
			{
				title: 'should support nested highlight',
				value: '==a ==b== c==',
				expected: '<p><mark>a <mark>b</mark> c</mark></p>'
			},
			{
				title: 'should return highlight with other syntax',
				value: 'hello, ==*markdown*==',
				expected: '<p>hello, <mark><em>markdown</em></mark></p>'
			},
			{
				title: 'should return normal text when escape highlight at opening',
				value: '=\\==markdown===',
				expected: '<p>===markdown===</p>'
			},
			{
				title: 'should return highlight with escaped content',
				value: 'hello, ==\\=markdown==',
				expected: '<p>hello, <mark>=markdown</mark></p>'
			},
			{
				title: 'should return normal text when escaped highlight marker',
				value: 'hello, \\==markdown==',
				expected: '<p>hello, ==markdown==</p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('subscript', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return subscript',
				value: 'h~2~o',
				expected: '<p>h<sub>2</sub>o</p>'
			},
			{
				title: 'should return noremal text when subscript in code',
				value: '`h~2~o`',
				expected: '<p><code>h~2~o</code></p>'
			},
			{
				title: 'should return normal text when triple tilde',
				value: 'h~~~2~~~o',
				expected: '<p>h~~~2~~~o</p>'
			},
			{
				title: 'should return normal text when missing closing marker',
				value: 'h~2o',
				expected: '<p>h~2o</p>'
			},
			{
				title: 'should return subscript',
				value: '~2~',
				expected: '<p><sub>2</sub></p>'
			},
			{
				title: 'should return subscript inside mark',
				value: '==~2~==',
				expected: '<p><mark><sub>2</sub></mark></p>'
			},
			{
				title: 'should support nested subscript',
				value: '~a ~b~ c~',
				expected: '<p><sub>a <sub>b</sub> c</sub></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('subscript', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return superscript',
				value: 'h^2^o',
				expected: '<p>h<sup>2</sup>o</p>'
			},
			{
				title: 'should return normal text when superscript in code',
				value: '`h^2^o`',
				expected: '<p><code>h^2^o</code></p>'
			},
			{
				title: 'should return normal text when double caret',
				value: 'h^^2^^o',
				expected: '<p>h^^2^^o</p>'
			},
			{
				title: 'should return normal text when missing closing marker',
				value: 'h^2o',
				expected: '<p>h^2o</p>'
			},
			{
				title: 'should return standalone superscript',
				value: '^2^',
				expected: '<p><sup>2</sup></p>'
			},
			{
				title: 'should return superscript inside mark',
				value: '==^2^==',
				expected: '<p><mark><sup>2</sup></mark></p>'
			},
			{
				title: 'should support nested superscript',
				value: '^a ^b^ c^',
				expected: '<p><sup>a <sup>b</sup> c</sup></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})
}
