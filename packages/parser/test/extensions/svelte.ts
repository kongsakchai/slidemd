import { describe, expect } from 'vitest'

import { Parse, Testcase, runTest } from '../helper'

export function svelteTestcase(parse: Parse) {
	describe('block', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return html block',
				value: '{@html variable}',
				expected: '{@html variable}'
			},
			{
				title: 'should return inline html block',
				value: 'hello {@html variable} markdown',
				expected: '<p>hello {@html variable} markdown</p>'
			},
			{
				title: 'should return html block with multiple line',
				value: '{@html \nvariable} this should consume',
				expected: '{@html \nvariable} this should consume'
			},
			{
				title: 'should return if block with multiple line',
				value: '{#if data == 1\n\n||data == 2}',
				expected: '{#if data == 1\n\n||data == 2}'
			},
			{
				title: 'should return if block with header',
				value: '{#if data}\n# header1\n## header2\n### header3\n{/if}',
				expected: '{#if data}\n<h1>header1</h1>\n<h2>header2</h2>\n<h3>header3</h3>\n{/if}'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)

			expect(String(file)).toBe(t.expected)
		})
	})

	describe('logic block', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return paragraph and variable',
				value: '{variable}',
				expected: '<p>{variable}</p>'
			},
			{
				title: 'should return paragraph and ternary',
				value: 'Age is: {variable >= 0 ? "OLD":"YOUNG"}',
				expected: '<p>Age is: {variable >= 0 ? "OLD":"YOUNG"}</p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)

			expect(String(file)).toBe(t.expected)
		})
	})

	describe('invalid syntax', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return normal text when start only { and newline',
				value: '{\n@html test}',
				expected: '<p>{\n@html test}</p>'
			},
			{
				title: 'should return normal text when invalid character in name block',
				value: '{@!html test}',
				expected: '<p>{@!html test}</p>'
			},
			{
				title: 'should return normal text when uncomplete',
				value: '{@html test',
				expected: '<p>{@html test</p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)

			expect(String(file)).toBe(t.expected)
		})
	})

	describe('interrupt', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return html block when interrupt',
				value: 'Hello\n{@html test}',
				expected: '<p>Hello</p>\n{@html test}'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)

			expect(String(file)).toBe(t.expected)
		})
	})
}
