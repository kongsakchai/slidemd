/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest'

import { imageTransformer } from '../../src/transformers/image'
import { Attribute } from '../../src/types'

const transform = (tree: any) => imageTransformer()(tree, null as any, null as any)

describe('image transformer', () => {
	test('should build filter and size styles from shorthand attributes', () => {
		const attribute: Attribute = {
			class: 'class-1',
			style: 'background: red;',
			w: '10px',
			h: '10px',
			blur: '5px',
			contrast: ''
		}

		transform({
			type: 'root',
			children: [{ type: 'image', data: { hProperties: attribute } }]
		})

		expect(attribute.style).contain('blur(5px)')
		expect(attribute.style).contain('contrast(2)')
		expect(attribute.style).contain('width:10px')
		expect(attribute.style).contain('height:10px')
		expect(attribute.w).toBeUndefined()
		expect(attribute.h).toBeUndefined()
		expect(attribute.blur).toBeUndefined()
		expect(attribute.contrast).toBeUndefined()
	})

	test("should don't transform when don't have parent", async () => {
		const attribute: Attribute = { w: '10px', h: '10px', blur: '5px', contrast: '', bg: '', absolute: '' }

		transform({ type: 'image', data: { hProperties: attribute } })

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
			children: [{ type: 'image', data: { hProperties: undefined } }]
		}

		transform(tree)

		expect(tree.children[0].data.hProperties).toBeUndefined()
	})

	test('should return original when no filter, bg, or size attribute', () => {
		const attribute: Attribute = { title: 'image' }

		transform({
			type: 'root',
			children: [{ type: 'image', data: { hProperties: attribute } }]
		})

		expect(attribute).toEqual({ title: 'image' })
	})

	test('should leave bg/absolute images in place (hoisting moved to extensions)', () => {
		const attribute1: Attribute = { bg: '' }
		const attribute2: Attribute = { class: 'absolute' }

		const tree = {
			type: 'root',
			children: [
				{
					type: 'paragraph',
					children: [
						{ type: 'image', data: { hProperties: attribute1 } },
						{ type: 'image', data: { hProperties: attribute2 } }
					]
				},
				{ type: 'image', data: { hProperties: { bg: '' } } }
			]
		}

		transform(tree)

		// imageTransformer no longer adds slide-background or hoists;
		// that behavior now lives in decko's hoistExtension + `img[bg]` CSS
		expect(attribute1).toEqual({ bg: '' })
		expect(attribute2).toEqual({ class: 'absolute' })
		expect(tree.children.length).toEqual(2)
		expect(tree.children[0].children.length).toEqual(2)
	})

	test('should not process the same image twice', () => {
		const attribute: Attribute = { w: '10px' }

		const tree = {
			type: 'root',
			children: [{ type: 'image', data: { hProperties: attribute } }]
		}

		transform(tree)
		transform(tree)

		expect(attribute.style).toEqual('width:10px')
	})

	test('should apply object-fit and preserve existing styles', () => {
		const attribute: Attribute = { styles: 'color:red', cover: '' } as any

		transform({
			type: 'root',
			children: [{ type: 'image', data: { hProperties: attribute } }]
		})

		expect(attribute.style).contain('color:red')
		expect(attribute.style).contain('object-fit:cover')
		expect(attribute.cover).toBeUndefined()
	})
})
