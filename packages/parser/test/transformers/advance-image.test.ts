/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest'

import { advanceImageTransformer } from '../../src/transformers/advance-image'
import { Attribute } from '../../src/types'

describe('advance image', () => {
	test('should return style filter', () => {
		const attribute: Attribute = {
			class: 'class-1',
			style: 'backgeound: red;',
			w: '10px',
			h: '10px',
			blur: '5px',
			contrast: ''
		}

		const tree = {
			type: 'root',
			children: [
				{
					type: 'image',
					data: { hProperties: attribute }
				}
			]
		}
		const transformer = advanceImageTransformer()
		transformer(tree, null as any, null as any)

		expect(attribute.style).contain('blur(5px)')
		expect(attribute.style).contain('contrast(2)')
		expect(attribute.style).contain('width:10px')
		expect(attribute.style).contain('height:10px')
		expect(attribute.style).contain('height:10px')
		expect(attribute.w).toBeUndefined()
		expect(attribute.h).toBeUndefined()
		expect(attribute.blur).toBeUndefined()
		expect(attribute.contrast).toBeUndefined()
	})

	test("should don't transform when don't have parent", async () => {
		const attribute: Attribute = {
			w: '10px',
			h: '10px',
			blur: '5px',
			contrast: '',
			bg: '',
			absolute: ''
		}

		const tree = {
			type: 'image',
			data: { hProperties: attribute }
		}

		const transformer = advanceImageTransformer()
		await transformer(tree, null as any, null as any)

		expect(attribute).toEqual({
			w: '10px',
			h: '10px',
			blur: '5px',
			contrast: '',
			bg: '',
			absolute: ''
		})
	})

	test("should don't transform when don't have attribute", () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'image',
					data: { hProperties: undefined }
				}
			]
		}
		const transformer = advanceImageTransformer()
		transformer(tree, null as any, null as any)

		expect(tree.children[0].data.hProperties).toBeUndefined()
	})

	test('should return original when no filter, bg, attribute', () => {
		const attribute: Attribute = {
			title: 'image'
		}

		const tree = {
			type: 'root',
			children: [
				{
					type: 'image',
					data: { hProperties: attribute }
				}
			]
		}
		const transformer = advanceImageTransformer()
		transformer(tree, null as any, null as any)

		expect(attribute).toEqual({
			title: 'image'
		})
	})

	test('should return background, absolute and remove parent', () => {
		const attribute1: Attribute = {
			bg: ''
		}

		const attribute2: Attribute = {
			absolute: ''
		}

		const tree = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'image',
							data: { hProperties: attribute1 }
						},
						{
							type: 'image',
							data: { hProperties: attribute2 }
						}
					]
				},
				{
					type: 'image',
					data: { hProperties: { bg: '' } }
				}
			]
		}
		const transformer = advanceImageTransformer()
		transformer(tree, null as any, null as any)

		expect(attribute1).toEqual({
			bg: '',
			class: 'slide-background'
		})
		expect(attribute2).toEqual({
			absolute: '',
			class: 'absolute'
		})
		expect(tree.children.length).toEqual(2)
	})
})
