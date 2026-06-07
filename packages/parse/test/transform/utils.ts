/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import {
	extractAttributes,
	extractClassNames,
	extractIDs,
	extractMaxStep,
	getAttributes,
	mapNode
} from '../../src/transform/utils'

export function utilsTestcase() {
	describe('extractAttribute', () => {
		it('should return attribute', () => {
			const str = 'step-1=1 step-2="2" step-3=\'3\' step-4'
			const attr = extractAttributes(str)

			expect(attr).toEqual({
				'step-1': '1',
				'step-2': '2',
				'step-3': '3',
				'step-4': ''
			})
		})

		it('should return empty when text is empty', () => {
			const attr = extractAttributes()

			expect(attr).toEqual({})
		})
	})

	describe('extractClassNames', () => {
		it('should return class names correctly', () => {
			const str = 'This is a .test string with .multiple .class names'
			const classNames = extractClassNames(str)

			expect(classNames).toEqual(['test', 'multiple', 'class'])
		})

		it('should return empty array for undefined or null input', () => {
			expect(extractClassNames()).toEqual([])
			expect(extractClassNames(null)).toEqual([])
		})
	})

	describe('extractIDs', () => {
		it('should return id names correctly', () => {
			const str = 'This is a #test string with #multiple #id names'
			const idNames = extractIDs(str)

			expect(idNames).toEqual(['test', 'multiple', 'id'])
		})

		it('should return empty array for undefined or null input', () => {
			expect(extractIDs()).toEqual([])
			expect(extractIDs(null)).toEqual([])
		})
	})

	describe('mapNode', () => {
		it('should return type of node', () => {
			const nodes = [
				{ type: 'code', value: 'console.log("Hello World")', lang: 'javascript' },
				{ type: 'paragraph', children: [{ type: 'text', value: 'This is a paragraph.' }] }
			]
			const tree = { type: 'root', children: nodes }

			const result = mapNode(tree, 'code', (node) => {
				return (node as any).type
			})

			expect(result).toEqual(['code'])
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

	describe('getAttributes', () => {
		it('should return 10 when max step is 10', () => {
			const attr = 'click={click} step-1'
			expect(getAttributes(attr)).toEqual({ click: '{click}', 'step-1': '', step: 1 })
		})
	})
}
