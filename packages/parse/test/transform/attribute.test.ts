/* eslint-disable @typescript-eslint/no-explicit-any */
import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'

import { attributeTransformer } from '../../src/transform/attribute'

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

		const transformer = attributeTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.data.hProperties).toEqual({
			id: 'id-1',
			class: 'class-1 class-2',
			data: '10',
			'step-1': 'bg',
			step: 1
		})
		expect(tree.children.length).toEqual(0)
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

		const transformer = attributeTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.data.hProperties).toEqual({
			'step-2': 'bg',
			step: 2
		})
		expect(vfile.data.step).toEqual(2)
	})

	it('should not transoform when attriubte without parent', () => {
		const tree = {
			type: 'attribute',
			value: '#id-1 .class-1 .class-2 data=10'
		}
		const vfile = new VFile()

		const transformer = attributeTransformer()
		transformer(tree, vfile, null as any)

		expect(tree).toEqual({
			type: 'attribute',
			value: '#id-1 .class-1 .class-2 data=10'
		})
	})

	it('should not transoform when attriubte not last', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'attribute',
					value: '#id-1 .class-1 .class-2 data=10 step-1=bg'
				},
				{
					type: 'text',
					value: 'test'
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()

		const transformer = attributeTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.children.length).toEqual(2)
	})
})
