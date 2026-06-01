/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Parent } from 'mdast'
import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'

import { codeblockTransformer } from '../../src/transform/codeblock'

describe('transformer codeblock', () => {
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

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as never)

		const container = tree.children[0] as never as Parent

		expect(container.type).toBe('container')
		expect(container.data?.hChildren?.[1]).toEqual({
			type: 'raw',
			value: '<span class="lang">javascript</span>'
		})
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

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as any as Parent

		expect(container.type).toBe('container')
		expect(container.data?.hChildren?.[1]).toEqual({
			type: 'raw',
			value: '<span class="lang">plaintext</span>'
		})
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

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as any as Parent

		expect(container.type).toBe('container')
		expect(container.data?.hChildren?.[1]).toEqual({
			type: 'raw',
			value: '<span class="lang">unknown</span>'
		})
	})

	it('should return original when without parent', async () => {
		const tree = {
			type: 'code',
			value: 'print("Hello World")',
			lang: 'unknown',
			meta: 'key=value .class1 #id1'
		}

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as any)

		expect(tree).toEqual({
			type: 'code',
			value: 'print("Hello World")',
			lang: 'unknown',
			meta: 'key=value .class1 #id1'
		})
	})

	it('should return mermaid js', async () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'code',
					value: 'graph TB\na-->b',
					lang: 'mermaid'
				}
			]
		}

		const vfile = new VFile()
		const transformer = codeblockTransformer()
		await transformer(tree, vfile, null as any)

		expect(tree.children.length).toBe(1)
		expect(tree.children[0].type).toBe('container')
	})

	it('should return codeblock with copy event name', async () => {
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

		const vfile = new VFile()
		const transformer = codeblockTransformer({ copyEventName: 'onClick' })
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as any as Parent

		expect(container.type).toBe('container')
		expect(container.data?.hChildren?.[0]).toEqual({
			type: 'raw',
			value: `<button id="code-copy-btn" class="copy" onclick="{onClick}"></button>`
		})
	})

	it('should return codeblock without button copy', async () => {
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

		const vfile = new VFile()
		const transformer = codeblockTransformer({ copyEventName: 'onClick', disableCopy: true })
		await transformer(tree, vfile, null as any)

		const container = tree.children[0] as any as Parent

		expect(container.type).toBe('container')
		expect(container.data?.hChildren?.[0]).toEqual({ type: 'raw', value: `<span class="lang">unknown</span>` })
	})
})
