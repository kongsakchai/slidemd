import { describe, expect } from 'vitest'

import { Parse, Testcase, runTest } from './helper'

export function imageTestcase(parse: Parse) {
	describe('attribute image', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return image with attribute',
				value: '![alt | class="bg-red-500"](./source.png)',
				expected: '<p><img src="./source.png" alt="alt" class="bg-red-500"></p>'
			},
			{
				title: 'should return image only alt',
				value: '![alt class=bg-red-500](./source.png)',
				expected: '<p><img src="./source.png" alt="alt class=bg-red-500"></p>'
			},
			{
				title: 'should return image only alt with empty attribute',
				value: '![alt |](./source.png)',
				expected: '<p><img src="./source.png" alt="alt"></p>'
			},
			{
				title: 'should return image only attribute',
				value: '![|class=bg-red-500](./source.png)',
				expected: '<p><img src="./source.png" alt class="bg-red-500"></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)

			expect(String(file)).toBe(t.expected)
		})
	})
}
