import { describe, expect } from 'vitest'

import { Parse, Testcase, runTest } from './helper'

export function imageTestcase(parse: Parse) {
	describe('attribute image', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return iamge with attribute',
				value: '![alt class="bg-red-500"](./source.png)',
				expected: '<p><img src="./source.png" alt="alt" class="bg-red-500"></p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)

			expect(String(file)).toBe(t.expected)
		})
	})
}
