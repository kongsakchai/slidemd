/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Parent } from 'mdast'
import { VFile } from 'vfile'
import { expect, test } from 'vitest'

import { codeblockTransformer } from '../../src/transformers/codeblock'

export function codeblockTransformTestcase() {
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

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent

		expect(container.data?.hChildren?.[0]).toEqual({
			type: 'raw',
			value: '<span class="lang">javascript</span>'
		})
		expect(container.data?.hProperties).toEqual({
			id: 'id1',
			class: 'class1',
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
					meta: 'key=value .class1 #id1'
				}
			]
		}

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent

		expect(container.data?.hChildren?.[0]).toEqual({
			type: 'raw',
			value: '<span class="lang">plaintext</span>'
		})
		expect(container.data?.hProperties).toEqual({
			id: 'id1',
			class: 'class1',
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

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as any)

		expect(tree.type).toEqual('code')
		expect(tree.value).toEqual(`console.log("Hello World")`)
	})

	test('should highlight code blocks correctly with option', async () => {
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

		const vfile = new VFile()
		const transformer = codeblockTransformer({
			createContainer: (lang: string) => {
				return {
					type: 'container',
					data: {
						hName: 'div',
						hChildren: [
							{
								type: 'raw',
								value: `<span class="lang">${lang}</span>`
							}
						]
					},
					children: []
				}
			},
			highlight: async (lang: string, code: string) => {
				return {
					type: 'element',
					tagName: 'pre',
					properties: {},
					children: [{ type: 'text', value: code }]
				}
			}
		})
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as never as Parent

		expect(container.data?.hChildren?.[0]).toEqual({
			type: 'raw',
			value: '<span class="lang">javascript</span>'
		})
		expect(container.data?.hProperties).toBeUndefined()
	})
}
