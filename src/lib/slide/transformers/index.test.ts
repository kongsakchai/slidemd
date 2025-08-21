import type { Element, Root as HRoot } from 'hast'
import type { Root } from 'mdast'
import { VFile } from 'vfile'
import { describe, expect, test } from 'vitest'
import {
	clickTransformer,
	codeTransformer,
	enhanceCodeTransformer,
	htmlTransformer,
	imageTransformer,
	splitTransformer,
	type Store
} from '.'

type rootType = 'root'

describe('html transformer', () => {
	test('should parse directive when html is comment and directive', () => {
		const htmls = [
			{
				type: 'html',
				value: '<!-- bgColor:#red -->'
			},
			{
				type: 'html',
				value: '<!-- _page:skip -->'
			},
			{
				type: 'html',
				value: '<!-- split:10px -->'
			}
		]

		const root = {
			type: 'root',
			children: htmls
		} as Root

		const file = new VFile()

		const transform = htmlTransformer()
		transform(root, file)

		const store = file.data.store as Store

		expect(store.localDirective).toStrictEqual({ page: 'skip' })
		expect(store.globalDirective).toStrictEqual({ bgColor: '#red' })
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

		const transform = htmlTransformer()
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

		const transform = htmlTransformer()
		transform(html, file)

		const expectedHtml = {
			type: 'html',
			value: '<!-- test comment no parent -->',
			children: []
		}

		expect(html).toStrictEqual(expectedHtml)
	})
})

describe('split transformer', () => {
	test('should parse split when html is comment and split pattern', () => {
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

		const transform = splitTransformer()
		transform(root, file)

		const store = file.data.store as Store

		expect(store.split.split).toBe(true)
		expect(store.split.size).toBe('50% 1fr 1fr')
	})

	test('should dont parse split when no parent', () => {
		const html = {
			type: 'html' as rootType,
			value: '<!-- split:50% -->',
			children: []
		} as Root

		const file = new VFile()

		const transform = splitTransformer()
		transform(html, file)

		const expectedHtml = {
			type: 'html',
			value: '<!-- split:50% -->',
			children: []
		}

		expect(html).toStrictEqual(expectedHtml)
	})
})

describe('image transformer', () => {
	test('should parse image', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: ''
		}

		const root = {
			type: 'root',
			children: [image],
			data: {
				hProperties: {
					style: 'object-fit: none'
				}
			}
		} as Root

		const expectedImage = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: '',
			data: {
				hProperties: {
					loading: 'lazy',
					style: 'object-fit: none',
					id: '',
					class: '',
					isAbsolute: false
				}
			}
		}

		const file = new VFile()

		const transform = imageTransformer()
		transform(root, file)

		expect(image).toStrictEqual(expectedImage)
	})

	test('should parse image and set parent to contents', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'absolute'
		}

		const root = {
			type: 'root',
			children: [image],
			data: {
				hProperties: {
					style: 'object-fit: none'
				}
			}
		} as Root

		const expectedImage = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'absolute',
			data: {
				hProperties: {
					loading: 'lazy',
					style: 'position: absolute; object-fit: none',
					id: '',
					class: '',
					isAbsolute: true
				}
			}
		}

		const file = new VFile()

		const transform = imageTransformer()
		transform(root, file)

		expect(image).toStrictEqual(expectedImage)
	})

	test('should parse image and dont set parent to contents', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'absolute'
		}
		const test = {
			type: 'text',
			value: 'Some text'
		}

		const root = {
			type: 'root',
			children: [image, test],
			data: {
				hProperties: {
					style: 'object-fit: none'
				}
			}
		} as Root

		const expectedImage = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'absolute',
			data: {
				hProperties: {
					loading: 'lazy',
					style: 'position: absolute; object-fit: none',
					id: '',
					class: '',
					isAbsolute: true
				}
			}
		}

		const file = new VFile()

		const transform = imageTransformer()
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

		const transform = imageTransformer()
		transform(root, file)

		expect(root.children[0]).toStrictEqual(expectedBgContainer)
	})

	test('should parse bg and dont clear parent', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'bg'
		}

		const text = {
			type: 'text',
			value: 'Some text'
		}

		const root = {
			type: 'root',
			children: [image, text]
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

		const transform = imageTransformer()
		transform(root, file)

		expect(root.children[1]).toStrictEqual(expectedBgContainer)
	})

	test('should parse bg and clear parent', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'bg'
		}

		const parent = {
			type: 'parent',
			children: [image]
		}

		const root = {
			type: 'root',
			children: [parent]
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

		const transform = imageTransformer()
		transform(root, file)

		expect(root.children[0]).toStrictEqual(expectedBgContainer)
	})

	test('should parse bg and vertical background and split', () => {
		const image = {
			type: 'image',
			url: 'https://example.com/image.png',
			alt: 'bg vertical'
		}

		const parent = {
			type: 'parent',
			children: [image]
		}
		const split = {
			type: 'parent',
			children: [parent]
		}

		const root = {
			type: 'root',
			children: [split]
		} as Root

		const expectedBgContainer = {
			type: 'bg-container',
			data: {
				hProperties: {
					class: 'background-container',
					style: '--bg-rows: 1fr'
				}
			},
			children: [
				{
					type: 'bg',
					data: {
						hProperties: {
							style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: no-repeat',
							isVertical: true,
							sizeGrid: '',
							class: 'background-image',
							id: ''
						}
					}
				}
			]
		}

		const expectedSplit = {
			type: 'parent',
			children: [expectedBgContainer]
		}

		const file = new VFile()
		file.data.store = {
			split: {
				split: true,
				splitSize: '1fr 1fr'
			}
		}

		const transform = imageTransformer()
		transform(root, file)

		expect(root.children[0]).toStrictEqual(expectedSplit)
	})

	test('should dont parse image if no parent', () => {
		const node = {
			type: 'image' as rootType,
			children: []
		} as Root

		const file = new VFile()

		const transform = imageTransformer()
		transform(node, file)

		const expectedHtml = {
			type: 'image',
			children: []
		}

		expect(node).toStrictEqual(expectedHtml)
	})
})

describe('code transformer', () => {
	test('should parse code block with language', () => {
		const codeBlock = {
			type: 'code',
			lang: 'js',
			value: 'console.log("Hello, world!");'
		}

		const root = {
			type: 'root',
			children: [codeBlock]
		} as Root

		const expectedCodeBlock = {
			children: [
				{
					type: 'html',
					value: '<button class="copy"></button>'
				},
				{
					type: 'html',
					value: '<span class="lang">js</span>'
				},
				{
					lang: 'js',
					meta: 'js',
					type: 'code',
					value: 'console.log("Hello, world!");'
				}
			],
			data: {
				hProperties: {
					class: 'language-js'
				}
			},
			type: 'parent'
		}

		const transform = codeTransformer()
		transform(root)

		expect(root.children[root.children.length - 1]).toStrictEqual(expectedCodeBlock)
	})

	test('should parse code block to mermaid', () => {
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

		const transform = codeTransformer()
		transform(root)

		expect(root.children[root.children.length - 1]).toStrictEqual(expectedCodeBlock)
	})

	test('should dont parse code if no parent', () => {
		const codeBlock = {
			type: 'code' as rootType,
			children: []
		} as Root

		const transform = codeTransformer()
		transform(codeBlock)

		const expectedCodeBlock = {
			type: 'code',
			children: []
		}

		expect(codeBlock).toStrictEqual(expectedCodeBlock)
	})

	test('should dont parse code block if no lang', () => {
		const codeBlock = {
			type: 'code',
			value: 'console.log("Hello, world!");'
		}

		const root = {
			type: 'root',
			children: [codeBlock]
		} as Root

		const expectedCodeBlock = {
			children: [
				{
					type: 'html',
					value: '<button class="copy"></button>'
				},
				{
					type: 'html',
					value: '<span class="lang"></span>'
				},
				{
					type: 'code',
					meta: undefined,
					value: 'console.log("Hello, world!");'
				}
			],
			data: {
				hProperties: {
					class: 'language-plaintext'
				}
			},
			type: 'parent'
		}

		const transform = codeTransformer()
		transform(root)

		expect(root.children[root.children.length - 1]).toStrictEqual(expectedCodeBlock)
	})
})

describe('enhance code transformer', () => {
	test('should enhance code blocks with shiki', async () => {
		const pre = {
			type: 'element',
			tagName: 'pre',
			properties: {},
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: { class: ['language-js'] },
					data: { meta: 'js' },
					children: [{ type: 'text', value: "console.log('Hello, world!');" }]
				}
			]
		} as Element

		const root = {
			type: 'root' as rootType,
			children: [pre]
		}

		const transform = enhanceCodeTransformer()
		await transform(root)

		expect(pre.properties.class).toContain('shiki')
	})

	test('should dont enhance code blocks if no parent', async () => {
		const pre = {
			type: 'element' as rootType,
			tagName: 'pre',
			properties: {},
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: {},
					data: { meta: 'js' },
					children: [{ type: 'text', value: "console.log('Hello, world!');" }]
				}
			]
		} as HRoot

		const expectedPre = {
			type: 'element' as rootType,
			tagName: 'pre',
			properties: {},
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: {},
					data: { meta: 'js' },
					children: [{ type: 'text', value: "console.log('Hello, world!');" }]
				}
			]
		} as HRoot

		const transform = enhanceCodeTransformer()
		await transform(pre)

		expect(pre).toStrictEqual(expectedPre)
	})
})

describe('click transformer', () => {
	test('should parse click data with only number', () => {
		const text = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {
					click: '3'
				}
			}
		}
		const root = {
			type: 'root',
			children: [text]
		} as Root

		const file = new VFile()

		const expected = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {
					click: '0:opacity-0,3:opacity-100'
				}
			}
		}

		const transform = clickTransformer()
		transform(root, file)

		expect(text).toStrictEqual(expected)

		const { click } = file.data.store as Store
		expect(click).toStrictEqual(3)
	})

	test('should parse click data with only class', () => {
		const text = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {
					click: '.opacity-50'
				}
			}
		}
		const root = {
			type: 'root',
			children: [text]
		} as Root

		const file = new VFile()

		const expected = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {
					click: '1:opacity-50'
				}
			}
		}

		const transform = clickTransformer()
		transform(root, file)

		expect(text).toStrictEqual(expected)

		const { click } = file.data.store as Store
		expect(click).toStrictEqual(1)
	})

	test('should parse click data with full syntax', () => {
		const text = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {
					click: '1:.opacity-50 2:".opacity-100 .translate-y-1/2"'
				}
			}
		}
		const root = {
			type: 'root',
			children: [text]
		} as Root

		const file = new VFile()

		const expected = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {
					click: '1:opacity-50,2:opacity-100 translate-y-1/2'
				}
			}
		}

		const transform = clickTransformer()
		transform(root, file)

		expect(text).toStrictEqual(expected)

		const { click } = file.data.store as Store
		expect(click).toStrictEqual(2)
	})

	test('should parse click data without click data', () => {
		const text = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {}
			}
		}
		const root = {
			type: 'root',
			children: [text]
		} as Root

		const file = new VFile()

		const expected = {
			type: 'text',
			value: 'This is a text',
			data: {
				hProperties: {}
			}
		}

		const transform = clickTransformer()
		transform(root, file)

		expect(text).toStrictEqual(expected)

		const { click } = file.data.store as Store
		expect(click).toStrictEqual(0)
	})
})
