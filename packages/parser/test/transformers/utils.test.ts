/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect } from 'vitest'

import { extractAttributes } from '../../src/transformers/utils'
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
				title: 'should return attribute',
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
			}
		]

		runTest(testcase, 'all', async (t) => {
			const result = extractAttributes(t.value)

			expect(result).toEqual(t.expected)
		})
	})
})
