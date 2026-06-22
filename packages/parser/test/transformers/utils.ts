/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { extractAttributes, extractMaxStep } from '../../src/transformers/utils'
import { Testcase, runTest } from '../helper'

export function utilsTestcase() {
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

	describe('extractMaxStep', () => {
		it('should return 10 when max step is 10', () => {
			const attr = {
				'step-5': '1',
				'step-10': '2'
			}
			expect(extractMaxStep(attr)).toBe(10)
		})

		it('should return 0 when string empty', () => {
			const attr = {}
			expect(extractMaxStep(attr)).toBe(0)
		})
	})
}
