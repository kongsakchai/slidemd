import type { Root } from 'mdast'
import { VFile } from 'vfile'
import { describe, expect, test } from 'vitest'
import { slideTransform, type DirectiveStore } from '.'

type rootType = 'root'

describe('html handlers', () => {
	test('should parse split size when html is comment and split pattern', () => {
		const htmls = [
			{
				type: 'html',
				value: '<!-- split:50% -->'
			},
			{
				type: 'html',
				value: '<!-- split -->'
			}
		]

		const root = {
			type: 'root',
			children: htmls
		} as Root

		const file = new VFile()

		const transform = slideTransform()
		transform(root, file)

		const directives = file.data.directives as DirectiveStore

		expect(directives.local.split).toBe(true)
		expect(directives.local.splitSize).toBe('50% 1fr 1fr')
	})

	test('should parse directive when html is comment and directive', () => {
		const htmls = [
			{
				type: 'html',
				value: '<!-- bgColor:#red -->'
			},
			{
				type: 'html',
				value: '<!-- _page:skip -->'
			}
		]

		const root = {
			type: 'root',
			children: htmls
		} as Root

		const file = new VFile()

		const transform = slideTransform()
		transform(root, file)

		const directives = file.data.directives as DirectiveStore

		expect(directives.local).toStrictEqual({ page: 'skip' })
		expect(directives.global).toStrictEqual({ bgColor: '#red' })
	})

	test('should parse attrs when html is comment and has parents', () => {
		const text = {
			type: 'text',
			value: 'This is a text',
			children: [
				{
					type: 'html',
					value: '<!-- #id .class alt="hello" -->'
				}
			]
		}

		const expectedText = {
			type: 'text',
			value: 'This is a text',
			children: [
				{
					type: 'html',
					value: '<!-- #id .class alt="hello" -->'
				}
			],
			data: {
				hProperties: {
					id: 'id',
					class: 'class',
					alt: 'hello'
				}
			}
		}

		const root = {
			type: 'root',
			children: [text]
		} as Root

		const file = new VFile()

		const transform = slideTransform()
		transform(root, file)

		expect(text).toStrictEqual(expectedText)
	})

	test('should dont parse html if no parent', () => {
		const html = {
			type: 'html' as rootType,
			value: '<!-- test comment no parent -->',
			children: []
		} as Root

		const file = new VFile()

		const transform = slideTransform()
		transform(html, file)

		const expectedHtml = {
			type: 'html',
			value: '<!-- test comment no parent -->',
			children: []
		}

		expect(html).toStrictEqual(expectedHtml)
	})
})

describe('image handlers', () => {
	test('should parse image', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: ''
		}

		const root = {
			type: 'root',
			children: [image]
		} as Root

		const expectedImage = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: '',
			data: {
				hProperties: {
					style: 'object-fit: none',
					id: '',
					class: '',
					isAbsolute: false
				}
			}
		}

		const file = new VFile()

		const transform = slideTransform()
		transform(root, file)

		expect(image).toStrictEqual(expectedImage)
	})

	test('should parse bg', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'bg'
		}

		const root = {
			type: 'root',
			children: [image]
		} as Root

		const expectedBgContainer = {
			type: 'bg-container',
			data: {
				hProperties: {
					class: 'background-container',
					style: '--bg-columns: 1fr'
				}
			},
			children: [
				{
					type: 'bg',
					data: {
						hProperties: {
							style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: no-repeat',
							isVertical: false,
							sizeGrid: '',
							class: 'background-image',
							id: ''
						}
					}
				}
			]
		}

		const file = new VFile()

		const transform = slideTransform()
		transform(root, file)

		expect(root.children[0]).toStrictEqual(expectedBgContainer)
	})

	test('should dont parse image if no parent', () => {
		const node = {
			type: 'image' as rootType,
			children: []
		} as Root

		const file = new VFile()

		const transform = slideTransform()
		transform(node, file)

		const expectedHtml = {
			type: 'image',
			children: []
		}

		expect(node).toStrictEqual(expectedHtml)
	})
})

describe('code handlers', () => {
	test('should parse code block with language', () => {
		const codeBlock = {
			type: 'code',
			lang: 'mermaid',
			value: 'console.log("Hello, world!");'
		}

		const root = {
			type: 'root',
			children: [codeBlock]
		} as Root

		const expectedCodeBlock = {
			type: 'html',
			value: '<pre class="mermaid">console.log("Hello, world!");</pre>'
		}

		const file = new VFile()

		const transform = slideTransform()
		transform(root, file)

		expect(root.children[0]).toStrictEqual(expectedCodeBlock)
	})

	test('should dont parse code if no parent', () => {
		const codeBlock = {
			type: 'code' as rootType,
			children: []
		} as Root

		const file = new VFile()

		const transform = slideTransform()
		transform(codeBlock, file)

		const expectedCodeBlock = {
			type: 'code',
			children: []
		}

		expect(codeBlock).toStrictEqual(expectedCodeBlock)
	})
})
