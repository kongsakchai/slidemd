/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import {
	asNumber,
	asString,
	extractAttributes,
	extractClassNames,
	extractIDs,
	extractMaxStep,
	getAttributes,
	mapNode,
	maxValue
} from '../../src/transform/helper'

describe('transform helper', () => {
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

	it('should return string when value is string', () => {
		const val: string | undefined = 'test'
		const resp = asString(val)
		expect(resp).toEqual('test')
	})

	it('should return default value when value is not string', () => {
		const val: string | undefined = undefined
		const resp = asString(val, 'test')
		expect(resp).toEqual('test')
	})

	it('should return number when value is number', () => {
		const val: number | undefined = 10
		const resp = asNumber(val)
		expect(resp).toEqual(10)
	})

	it('should return default value when value is not number', () => {
		const val: string | undefined = undefined
		const resp = asNumber(val, 0)
		expect(resp).toEqual(0)
	})

	it('should return a when b is empty', () => {
		const a = 10
		const b = undefined
		const resp = maxValue(a, b)
		expect(resp).toEqual(10)
	})

	it('should return b when a is empty', () => {
		const a = undefined
		const b = 10
		const resp = maxValue(a, b)
		expect(resp).toEqual(10)
	})

	it('should return undefined when a and b is empty', () => {
		const a = undefined
		const b = undefined
		const resp = maxValue(a, b)
		expect(resp).toBeUndefined()
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
