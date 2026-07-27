/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { attributeTransformer } from '../../src/transformers/attribute'
import { buildVFile } from './helper'

describe('attribute transformer', () => {
	it('should run matching attribute processors and allow skip to halt a processor', () => {
		const seen: string[] = []
		const tree = {
			type: 'root',
			children: [
				{
					type: 'image',
					data: { hProperties: { 'data-x': '1', 'data-y': '2' } }
				}
			]
		}
		const vfile = buildVFile()

		const transformer = attributeTransformer({
			attributeProcess: [
				{
					key: /^data-/,
					process: ({ key }) => {
						seen.push(key)
						return 'skip'
					}
				}
			]
		})

		transformer(tree, vfile, null as any)

		// skip stops the processor after the first match
		expect(seen).toEqual(['data-x'])
	})

	it('should only process nodes whose type matches the processor types', () => {
		const seen: string[] = []
		const tree = {
			type: 'root',
			children: [
				{ type: 'image', data: { hProperties: { width: 10 } } },
				{ type: 'code', data: { hProperties: { width: 20 } } }
			]
		}
		const vfile = buildVFile()

		attributeTransformer({
			attributeProcess: [
				{
					key: 'width',
					types: ['image'],
					process: ({ value }) => {
						seen.push(String(value))
					}
				}
			]
		})(tree, vfile, null as any)

		expect(seen).toEqual(['10'])
	})

	it('should match a string key', () => {
		const seen: string[] = []
		const tree = {
			type: 'root',
			children: [{ type: 'image', data: { hProperties: { alt: 'x', title: 'y' } } }]
		}
		const vfile = buildVFile()

		attributeTransformer({
			attributeProcess: [{ key: 'alt', process: ({ value }) => seen.push(String(value)) }]
		})(tree, vfile, null as any)

		expect(seen).toEqual(['x'])
	})

	it('should ignore nodes without hProperties', () => {
		const tree = { type: 'root', children: [{ type: 'image', data: {} }] }
		const vfile = buildVFile()

		expect(() => attributeTransformer()(tree, vfile, null as any)).not.toThrow()
	})
})
