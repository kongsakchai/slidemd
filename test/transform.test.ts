import { describe, expect, it } from 'vitest'
import { extractAttributes, extractClassNames, extractIDs, mapNode } from '../src/transform/helper'
import { transformerHighlight } from '../src/transform/shiki'

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

	it('should return type of node correctly', () => {
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

describe('transformer code highlighter', () => {
	it('should highlight code blocks correctly', async () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'code',
					value: 'console.log("Hello World")',
					lang: 'javascript',
					meta: 'key=value .class1 #id1'
				}
			]
		}

		const transformer = transformerHighlight()
		await transformer(tree, null as any, null as any)

		expect(tree.children.length).toBe(1)
		expect(tree.children[0].type).toBe('codeContainer')
		expect((tree.children[0] as any).children[1].value).toEqual('<span class="lang">javascript</span>')
	})

	it('should handle code blocks without language specified', async () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'code',
					value: 'print("Hello World")',
					meta: 'key=value .class1 #id1'
				}
			]
		}

		const transformer = transformerHighlight()
		await transformer(tree, null as any, null as any)

		expect(tree.children.length).toBe(1)
		expect(tree.children[0].type).toBe('codeContainer')
		expect((tree.children[0] as any).children[1].value).toEqual('<span class="lang">plaintext</span>')
	})

	it('should handle code blocks with unknown language', async () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'code',
					value: 'print("Hello World")',
					lang: 'unknown',
					meta: 'key=value '
				}
			]
		}

		const transformer = transformerHighlight()
		await transformer(tree, null as any, null as any)

		expect(tree.children.length).toBe(1)
		expect(tree.children[0].type).toBe('codeContainer')
		expect((tree.children[0] as any).children[1].value).toEqual('<span class="lang">unknown</span>')
	})

	it('should handle code blocks without parent', async () => {
		const tree = {
			type: 'code',
			value: 'print("Hello World")',
			lang: 'unknown',
			meta: 'key=value .class1 #id1'
		}

		const transformer = transformerHighlight()
		await transformer(tree, null as any, null as any)

		expect(tree).toEqual({
			type: 'code',
			value: 'print("Hello World")',
			lang: 'unknown',
			meta: 'key=value .class1 #id1'
		})
	})
})
