/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Parent } from 'mdast'
import { describe, expect, test } from 'vitest'

import { codeblockTransformer } from '../../src/transformers/codeblock'
import { buildVFile } from './helper'

describe('codeblock syntax', () => {
	test('should highlight code blocks correctly', async () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'code',
					value: 'console.log("Hello World",{data})',
					lang: 'javascript',
					meta: 'key=value .class1 #id1'
				}
			]
		}

		const vfile = buildVFile()
		await codeblockTransformer()(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent

		expect(container.data?.hChildren?.[0]).toEqual({
			type: 'raw',
			value: '<span class="lang">javascript</span>'
		})
		expect(container.data?.hProperties).toEqual({
			id: 'id1',
			class: 'language-javascript class1',
			key: 'value'
		})
	})

	test('should highlight code blocks without lang', async () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'code',
					value: 'console.log("Hello World")',
					lang: '',
					meta: 'key=value #id1'
				}
			]
		}

		const vfile = buildVFile()
		await codeblockTransformer()(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent

		expect(container.data?.hChildren?.[0]).toEqual({
			type: 'raw',
			value: '<span class="lang">plaintext</span>'
		})
		expect(container.data?.hProperties).toEqual({
			id: 'id1',
			class: 'language-plaintext',
			key: 'value'
		})
	})

	test("should don't transform when don't have parent", async () => {
		const tree = {
			type: 'code',
			value: 'console.log("Hello World")',
			lang: 'javascript',
			meta: 'key=value .class1 #id1'
		}

		const vfile = buildVFile()
		await codeblockTransformer()(tree, vfile, null as any)

		expect(tree.type).toEqual('code')
		expect(tree.value).toEqual(`console.log("Hello World")`)
	})

	test('should use custom container and highlight', async () => {
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

		const vfile = buildVFile()
		const transformer = codeblockTransformer({
			container: async (ctx) => ({
				type: 'container',
				data: {
					hName: 'div',
					hChildren: [{ type: 'raw', value: `<span class="lang">${ctx.lang}</span>` }]
				},
				children: []
			}),
			highlight: async (ctx) => ({
				type: 'element',
				tagName: 'pre',
				properties: {},
				children: [{ type: 'text', value: ctx.code }]
			})
		})
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent

		expect(container.data?.hChildren?.[0]).toEqual({
			type: 'raw',
			value: '<span class="lang">javascript</span>'
		})
		expect(container.data?.hProperties).toBeUndefined()
	})

	test('should escape curly braces in highlighted text', async () => {
		const tree = {
			type: 'root',
			children: [{ type: 'code', value: 'const x = { a: 1 }', lang: 'ts', meta: '' }]
		}

		const vfile = buildVFile()
		await codeblockTransformer()(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent
		const pre = container.data?.hChildren?.[1] as any
		expect(pre.children[0].value).toEqual(`const x = {'{'} a: 1 {'}'}`)
	})

	test('should default meta to empty string when missing', async () => {
		const tree = {
			type: 'root',
			children: [{ type: 'code', value: 'hi', lang: 'ts' }]
		}

		const vfile = buildVFile()
		await codeblockTransformer()(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent
		expect(container.data?.hProperties).toEqual({ class: 'language-ts' })
	})
})
