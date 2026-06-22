import { describe, expect } from 'vitest'

import { runTest } from './helper'

describe('helper', () => {
	describe('should run only second testcase when index is 1', () => {
		runTest(
			[
				{
					title: 'should not test me when index is 1',
					value: '',
					expected: ''
				},
				{
					title: 'should test only me when index is 1',
					value: '',
					expected: ''
				}
			],
			1,
			async (t) => {
				expect(t.value).toBe(t.expected)
			}
		)
	})
})
