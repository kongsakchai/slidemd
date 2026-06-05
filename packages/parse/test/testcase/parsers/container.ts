import { describe, expect } from 'vitest'

import { Testcase, runTest } from '../../helper'

type Parse = (str: string) => Promise<string>

export function containerTestcase(parse: Parse) {
	describe('container', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return div without content',
				value: ':::div\n:::',
				expected: '<div></div>'
			},
			{
				title: 'should return section without content',
				value: ':::section\n:::',
				expected: '<section></section>'
			},
			{
				title: 'should return container with content',
				value: ':::div\n# Hello\n:::',
				expected: '<div><h1>Hello</h1></div>'
			},
			{
				title: 'should return container with content after blank line',
				value: ':::div\n# Header1\n ## Header2\n:::',
				expected: '<div><h1>Header</h1></div>'
			}
		]

		runTest(testcase, 3, async (t) => {
			const file = await parse(t.value)
			expect(file).toBe(t.expected)
		})
	})
}
