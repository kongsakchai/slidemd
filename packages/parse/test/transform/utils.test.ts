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

describe('transform utils', () => {
	it('should attribute extractor work correctly', () => {
		const str = 'key1=value1 key2="value with spaces" key3=\'another value\' key4 key5=value5'
		const attrs = extractAttributes(str)

		expect(attrs).toEqual({
			key1: 'value1',
			key2: 'value with spaces',
			key3: 'another value',
			key4: true,
			key5: 'value5'
		})
	})

	it('should return empty object for undefined or null input', () => {
		expect(extractAttributes()).toEqual({})
		expect(extractAttributes(null)).toEqual({})
	})

	it('should return class names correctly', () => {
		const str = 'This is a .test string with .multiple .class names'
		const classNames = extractClassNames(str)

		expect(classNames).toEqual(['test', 'multiple', 'class'])
	})

	it('should return empty array for undefined or null input', () => {
		expect(extractClassNames()).toEqual([])
		expect(extractClassNames(null)).toEqual([])
	})

	it('should return id names correctly', () => {
		const str = 'This is a #test string with #multiple #id names'
		const idNames = extractIDs(str)

		expect(idNames).toEqual(['test', 'multiple', 'id'])
	})

	it('should return empty array for undefined or null input', () => {
		expect(extractIDs()).toEqual([])
		expect(extractIDs(null)).toEqual([])
	})

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

	it('should return attributes', () => {
		const resp = getAttributes("#id-1 .class-1 .class-2 class='class-3 class-4' step-2='bg'")
		expect(resp).toEqual({
			id: 'id-1',
			class: 'class-1 class-2 class-3 class-4',
			'step-2': 'bg',
			step: 2
		})
	})

	it('should return attributes without class, id and step', () => {
		const resp = getAttributes('data=10 step=0')
		expect(resp).toEqual({
			data: '10'
		})
	})

	it('should return 10 when max step is 10', () => {
		const str = 'step-5 step-10'
		expect(extractMaxStep(str)).toBe(10)
	})

	it('should return 0 when string empty', () => {
		const str = ''
		expect(extractMaxStep(str)).toBe(0)
	})
})
