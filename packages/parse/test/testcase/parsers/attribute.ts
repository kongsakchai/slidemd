import { describe, expect } from 'vitest'

import { Testcase, runTest } from '../../helper'

type Parse = (str: string) => Promise<string>

export function attributeTestcase(parse: Parse) {
	describe('success', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return only content when attribute parser correctly',
				value: '# hello, markdown @{.title disable} ',
				expected: '<h1>hello, markdown </h1>'
			},
			{
				title: 'should return only content when attribute parser correctly #2',
				value: 'hello, markdown @{ #test step-1= step-2="data" step-3=data }',
				expected: '<p>hello, markdown </p>'
			},
			{
				title: 'should return only content when attribute parser correctly #3',
				value: 'hello, markdown @{ #test click={isEnable?"value 1":"value2"}}',
				expected: '<p>hello, markdown </p>'
			},
			{
				title: 'should return only content when attribute parser correctly #4',
				value: 'hello, markdown @{ click class:hello $click }',
				expected: '<p>hello, markdown </p>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})

	describe('invalid', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return normal text when attribute not last token',
				value: '# hello, markdown @{.title} text',
				expected: '<h1>hello, markdown @{.title} text</h1>'
			},
			{
				title: 'should return only content when attribute parser correctly',
				value: '# hello, markdown @{.title',
				expected: '<h1>hello, markdown @{.title</h1>'
			},
			{
				title: 'should return normal text when attribute parser invalid',
				value: '# hello, markdown @{ click=',
				expected: '<h1>hello, markdown @{ click=</h1>'
			},
			{
				title: 'should return normal text when attribute parser invalid #2',
				value: '# hello, markdown @{',
				expected: '<h1>hello, markdown @{</h1>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const val = await parse(t.value)
			expect(val).toBe(t.expected)
		})
	})
}
