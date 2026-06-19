import { describe, expect } from 'vitest'

import { Parse, Testcase, runTest } from './helper'

export function imageTestcase(parse: Parse) {
	describe('image attribute', () => {
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
			},
			{
				title: 'should return image only attribute',
				value: '![|class=bg-red-500](./source.png)',
				expected: '<p><img src="./source.png" alt class="bg-red-500"></p>'
			},
			{
				title: 'should normal text when attribute outside image',
				value: '![](./source.png) | class="bg-red-500"',
				expected: '<p><img src="./source.png" alt> | class="bg-red-500"</p>'
			},
			{
				title: 'should attribute with endline',
				value: '![alt | class=bg-red-500\ntest](./source.png)"',
				expected: '<p><img src="./source.png" alt="alt" class="bg-red-500" test>"</p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)

			expect(String(file)).toBe(t.expected)
		})
	})
}
