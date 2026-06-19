/* eslint-disable @typescript-eslint/no-explicit-any */
import { VFile } from 'vfile'
import { expect, test } from 'vitest'

import { attributeBlockTransformer } from '../../src/transformers/attribute-block'

export function attributeTransformTestcase() {
	test('should return parent have attriubte', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'attributeBlock',
					attr: {
						id: 'id-1',
						class: 'class-1 class-2',
						data: '10',
						'step-1': 'bg',
						step: 1,
						array: [1, 2, 3]
					}
				}
			],
			data: {
				hProperties: {}
			}
		}
		const vfile = new VFile()

		const transformer = attributeBlockTransformer()
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

	test("should don't transform when attriubte without parent", () => {
		const tree = {
			type: 'attributeBlock',
			attr: {
				'step-2': 'bg',
				step: 2
			}
		}
		const vfile = new VFile()

		const transformer = attributeBlockTransformer()
		transformer(tree, vfile, null as any)

		expect(tree).toEqual({
			type: 'attributeBlock',
			attr: {
				'step-2': 'bg',
				step: 2
			}
		})
	})

	test('should not transoform when attriubte not last', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'attributeBlock',
					attr: {
						'step-2': 'bg',
						step: 2
					}
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

		const transformer = attributeBlockTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.children.length).toEqual(2)
	})
}
