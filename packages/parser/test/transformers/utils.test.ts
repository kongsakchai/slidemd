/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { extractAttributes } from '../../src/transformers/codeblock'
import { Testcase, runTest } from '../helper'

describe('utils', () => {
	describe('extract attribute', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return attribute',
				value: 'id="test-id" hidden class="test-class" #short-id .short-class use:svelte={true}',
				expected: {
					class: 'test-class short-class',
					hidden: '',
					id: 'test-id short-id',
					'use:svelte': '{true}'
				}
			},
			{
				title: 'should return attribute without class',
				value: 'hidden use:svelte={true}',
				expected: {
					hidden: '',
					'use:svelte': '{true}'
				}
			},
			{
				title: 'should return empty attribute',
				value: '',
				expected: {}
			},
			{
				title: 'should parse unquoted value',
				value: 'key=value .class1 #id1',
				expected: { class: 'class1', id: 'id1', key: 'value' }
			},
			{
				title: 'should skip keys with excepted chars',
				value: 'bg@sm=foo arr[0]=1 path/a=b',
				expected: {}
			}
		]

		runTest(testcase, 'all', async (t) => {
			expect(extractAttributes(t.value)).toEqual(t.expected)
		})
	})

	it('should return empty for null or undefined input', () => {
		expect(extractAttributes(undefined)).toEqual({})
		expect(extractAttributes(null)).toEqual({})
	})
})
