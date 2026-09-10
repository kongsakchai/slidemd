/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { extensionsTransform, hoistToParentExtension } from '../../src/transformers/extensions'
import { buildVFile } from './helper'

describe('extensions transformer', () => {
	it('should run extensions on every non-root node', () => {
		const tree = {
			type: 'root',
			children: [
				{ type: 'paragraph', data: { hProperties: { class: 'x' } }, children: [] },
				{ type: 'image', data: { hProperties: { bg: 'a.png' } } }
			]
		}
		const vfile = buildVFile()
		const seen: string[] = []

		extensionsTransform({
			extensions: [(ctx) => seen.push(ctx.node.type)]
		})(tree as any, vfile, null as any)

		expect(seen).toEqual(['paragraph', 'image'])
	})

	it('should apply attribute mutations back to hProperties', () => {
		const tree = {
			type: 'root',
			children: [{ type: 'image', data: { hProperties: { bg: 'a.png' } } }]
		}
		const vfile = buildVFile()

		extensionsTransform({
			extensions: [
				(ctx) => {
					if (ctx.node.type === 'image') ctx.attribute.class = 'slide-background'
				}
			]
		})(tree as any, vfile, null as any)

		expect((tree.children[0] as any).data.hProperties.class).toBe('slide-background')
	})

	it('should give nodes without hProperties an empty attribute object', () => {
		const tree = { type: 'root', children: [{ type: 'paragraph', data: {}, children: [] }] }
		const vfile = buildVFile()
		const seen: unknown[] = []

		expect(() =>
			extensionsTransform({
				extensions: [(ctx) => seen.push(ctx.attribute)]
			})(tree as any, vfile, null as any)
		).not.toThrow()
		expect(seen).toEqual([{}])
	})

	it('should queue post extensions when `when` matches and apply them after traversal', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'container',
					data: { hName: 'div', hProperties: {} },
					children: [
						{ type: 'image', data: { hProperties: { bg: 'a.png' } } },
						{ type: 'paragraph', data: { hProperties: {} }, children: [] }
					]
				}
			]
		}
		const vfile = buildVFile()
		const order: string[] = []

		extensionsTransform({
			extensions: [(ctx) => order.push(`visit:${ctx.node.type}`)],
			postExtensions: [
				{
					when: (ctx) => ctx.attribute.bg !== undefined,
					extension: (ctx) => {
						order.push(`post:${ctx.node.type}`)
						hoistToParentExtension(ctx)
					}
				}
			]
		})(tree as any, vfile, null as any)

		// all visits happen before any post extension runs
		expect(order).toEqual(['visit:container', 'visit:image', 'visit:paragraph', 'post:image'])

		// image hoisted out of container, placed where the container was
		expect((tree.children[0] as any).type).toBe('image')
		expect((tree.children[1] as any).type).toBe('container')
		expect((tree.children[1] as any).children).toHaveLength(1)
	})

	it('should not apply post extensions when `when` returns false', () => {
		const tree = {
			type: 'root',
			children: [{ type: 'image', data: { hProperties: {} } }]
		}
		const vfile = buildVFile()
		let applied = false

		extensionsTransform({
			postExtensions: [
				{
					when: (ctx) => ctx.attribute.bg !== undefined,
					extension: () => {
						applied = true
					}
				}
			]
		})(tree as any, vfile, null as any)

		expect(applied).toBe(false)
	})
})

describe('hoistToParentExtension', () => {
	it('should remove the parent when hoisting empties it', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'container',
					data: { hName: 'div', hProperties: {} },
					children: [{ type: 'image', data: { hProperties: { bg: 'a.png' } } }]
				}
			]
		}
		const vfile = buildVFile()

		extensionsTransform({
			postExtensions: [{ when: () => true, extension: hoistToParentExtension }]
		})(tree as any, vfile, null as any)

		// container had only the image -> hoisted and container dropped
		expect(tree.children).toHaveLength(1)
		expect((tree.children[0] as any).type).toBe('image')
	})

	it('should do nothing when the node has no grandparent', () => {
		const tree = {
			type: 'root',
			children: [{ type: 'image', data: { hProperties: { bg: 'a.png' } } }]
		}
		const vfile = buildVFile()

		extensionsTransform({
			postExtensions: [{ when: () => true, extension: hoistToParentExtension }]
		})(tree as any, vfile, null as any)

		expect(tree.children).toHaveLength(1)
		expect((tree.children[0] as any).type).toBe('image')
	})
})
