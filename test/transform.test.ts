import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'
import { transformerAttribute } from '../src/transform/attribute'
import {
	extractAttributes,
	extractClassNames,
	extractIDs,
	fallbackParseInt,
	getAttributes,
	getStepMax,
	mapNode
} from '../src/transform/helper'
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

	it('should return number when string correctly', () => {
		const result = fallbackParseInt('10', 5)
		expect(result).toEqual(10)
	})

	it('should return fallback when string incorrect', () => {
		const result = fallbackParseInt('aaa', 5)
		expect(result).toEqual(5)
	})

	it('should return new step when step format correctly', () => {
		const resp = getStepMax(10, 'step-100')
		expect(resp).toEqual(100)
	})

	it('should return current when step format incorrect', () => {
		const resp = getStepMax(10, 'step-aaa')
		expect(resp).toEqual(10)
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

describe('transform attribute', () => {
	it('should return parent have attriubte', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'attribute',
					value: '#id-1 .class-1 .class-2 data=10 step-1=bg'
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()

		const transformer = transformerAttribute()
		transformer(tree, vfile, null as any)

		expect(tree.data.hProperties).toEqual({
			id: 'id-1',
			class: 'class-1 class-2',
			data: '10',
			'step-1': 'bg',
			step: 1
		})
		expect(vfile.data.step).toEqual(1)
	})

	it('should return parent with step', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'attribute',
					value: 'step-2=bg'
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()
		vfile.data.step = 1

		const transformer = transformerAttribute()
		transformer(tree, vfile, null as any)

		expect(tree.data.hProperties).toEqual({
			'step-2': 'bg',
			step: 2
		})
		expect(vfile.data.step).toEqual(2)
	})

	it('should same when attriubte without parent', () => {
		const tree = {
			type: 'attribute',
			value: '#id-1 .class-1 .class-2 data=10'
		}
		const vfile = new VFile()

		const transformer = transformerAttribute()
		transformer(tree, vfile, null as any)

		expect(tree).toEqual({
			type: 'attribute',
			value: '#id-1 .class-1 .class-2 data=10'
		})
	})
})
