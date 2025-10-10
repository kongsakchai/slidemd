import type { Code, Parent, RootContent } from 'mdast'
import { unified } from 'unified'
import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'
import {
	createSplitParent,
	enhanceCode,
	enhanceImage,
	escapeCode,
	getMaxClickable,
	parseAttributes,
	parseClass,
	remarkSlideMD
} from './markdown'

describe('markdown.ts', async () => {
	it('should reture attributes', () => {
		const payload = 'key=value key:value key-2="value2" key3'
		const expected = {
			key: 'value',
			'key:value': '',
			'key-2': 'value2',
			key3: ''
		}

		const attrs = parseAttributes(payload)
		expect(attrs).toEqual(expected)
	})

	it('should return class', () => {
		const payload = 'key=value .text-red-500 .hover:text-blue-500'
		const expected = ['text-red-500', 'hover:text-blue-500']

		const attrs = parseClass(payload)
		expect(attrs).toEqual(expected)
	})

	it('should return split parent', () => {
		const expected = {
			type: 'parent',
			children: [],
			data: {
				hName: 'section',
				hProperties: {
					class: 'split-contents'
				}
			}
		}

		const attrs = createSplitParent([])
		expect(attrs).toEqual(expected)
	})

	it('should return escape code', () => {
		const expected = "{'{'} {'}'} {'<'} {'>'} {'&'}"

		const attrs = escapeCode('{ } < > &')
		expect(attrs).toEqual(expected)
	})

	it('should return max click', () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'text',
					data: {
						hProperties: {
							'click-3': ''
						}
					},
					value: ''
				},
				{
					type: 'text',
					data: {
						hProperties: {
							'click-5': 'top-500%'
						}
					},
					value: ''
				}
			] as RootContent[]
		} as Parent

		const newP = {
			type: 'parent',
			children: [
				{
					type: 'text',
					data: {
						hProperties: {
							class: 'opacity-0',
							'click-0': 'opacity-0',
							'click-3': 'opacity-100'
						}
					},
					value: ''
				},
				{
					type: 'text',
					data: {
						hProperties: {
							'click-5': 'top-500%'
						}
					},
					value: ''
				}
			] as RootContent[]
		} as Parent

		const expected = 5

		const click = getMaxClickable(p)
		expect(click).toBe(expected)
		expect(p).toEqual(newP)
	})

	it('should enhance code', async () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'code',
					lang: 'mermaid',
					meta: 'class:border-red-10',
					value: 'this is mermaid'
				},
				{
					type: 'code',
					lang: 'js',
					value: 'console.log("hello, world")'
				}
			] as Code[]
		} as Parent

		const newP = {
			type: 'parent',
			children: [
				{
					type: 'parent',
					data: {
						hName: 'pre',
						hProperties: {
							class: 'mermaid',
							'class:border-red-10': ''
						}
					},
					children: [
						{
							type: 'text',
							value: 'this is mermaid'
						}
					]
				},
				{
					type: 'parent',
					data: {
						hProperties: {
							class: 'language-js'
						},
						hChildren: [
							{
								type: 'raw',
								value: `<button class="copy"></button>`
							},
							{
								type: 'raw',
								value: `<span class="lang">js</span>`
							},
							{
								type: 'raw',
								value: 'mock'
							}
						]
					},
					children: []
				}
			] as Parent[]
		} as Parent

		await enhanceCode(p)
		expect(p.children[0]).toEqual(newP.children[0])
		expect(p.children[1].data?.hProperties).toEqual(newP.children[1].data?.hProperties)
		expect(p.children[1].data?.hChildren?.slice(0, -1)).toEqual(newP.children[1].data?.hChildren?.slice(0, -1))
	})
})

describe('markdown.ts -> enhanceImage', () => {
	it('should return image with 3 filters, height, obj-pos, top, no-repeat', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img blur contrast=3 cover h=10px left top top=15px no-repeat title=test',
					url: 'mock.com'
				}
			]
		} as Parent

		const expected = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img',
					url: 'mock.com',
					data: {
						hProperties: {
							title: 'test',
							class: undefined,
							loading: 'lazy',
							style: 'filter: blur(10px) contrast(3);object-position: top;object-fit: cover;height: 10px;top: 15px'
						}
					}
				}
			]
		}

		enhanceImage(parent)
		expect(parent).toEqual(expected)
	})

	it('should return image with obj-pos-x, obj-pos-y, absolute with parent, left, rigjt, bottom', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'image',
							alt: 'img x=10px y=30px absolute left=10% right=12px bottom=10px',
							url: 'mock.com'
						}
					]
				}
			]
		} as Parent
		const expected = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [],
					data: {
						hProperties: {
							class: 'hidden'
						}
					}
				},
				{
					type: 'image',
					alt: 'img',
					url: 'mock.com',
					data: {
						hProperties: {
							absolute: true,
							class: undefined,
							loading: 'lazy',
							style: 'object-position: 10px 30px;left: 10%;right: 12px;bottom: 10px;position: absolute'
						}
					}
				}
			]
		}

		enhanceImage(parent)
		expect(parent).toEqual(expected)
	})

	it('should return image with obj-pos-x, absolute without parent', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img x=10px absolute',
					url: 'mock.com'
				}
			]
		} as Parent
		const expected = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img',
					url: 'mock.com',
					data: {
						hProperties: {
							absolute: true,
							class: undefined,
							loading: 'lazy',
							style: 'object-position: 10px 50%;position: absolute'
						}
					}
				}
			]
		}

		enhanceImage(parent)
		expect(parent).toEqual(expected)
	})

	it('should return image with obj-pos-y, width, absolute without parent click-0', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img y=10px w=15px absolute',
					url: 'mock.com'
				}
			]
		} as Parent
		const expected = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img',
					url: 'mock.com',
					data: {
						hProperties: {
							absolute: true,
							class: undefined,
							loading: 'lazy',
							style: 'object-position: 50% 10px;width: 15px;position: absolute'
						}
					}
				}
			]
		}

		enhanceImage(parent)
		expect(parent).toEqual(expected)
	})

	it('should return bg with 3 filters,bg-position, bg-size, repeat-x', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img bg blur contrast=3 left top cover repeat-x=space',
					url: 'mock.com'
				}
			]
		} as Parent

		const expected = {
			type: 'parent',
			children: [
				{
					type: 'parent',
					data: {
						hProperties: {
							class: 'advanced-bg',
							style: '--bg-columns: 1fr',
							vertical: false
						}
					},
					children: [
						{
							type: 'bg',
							data: {
								hProperties: {
									bg: true,
									class: 'advanced-bg-image',
									style: 'background-image: url(mock.com);background-filter: blur(10px) contrast(3);background-position: top;background-size: cover;background-repeat: space no-repeat'
								}
							}
						}
					]
				}
			]
		}

		enhanceImage(parent)
		expect(parent).toEqual(expected)
	})

	it('should return bg with vertical, bg-position-x, bg-size-w', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'image',
					alt: 'img bg vertical x=12% w=100px',
					url: 'mock.com'
				}
			]
		} as Parent

		const expected = {
			type: 'parent',
			children: [
				{
					type: 'parent',
					data: {
						hProperties: {
							class: 'advanced-bg',
							style: '--bg-rows: 1fr',
							vertical: true
						}
					},
					children: [
						{
							type: 'bg',
							data: {
								hProperties: {
									bg: true,
									class: 'advanced-bg-image',
									style: 'background-image: url(mock.com);background-position: 12% 50%;background-size: 100px auto'
								}
							}
						}
					]
				}
			]
		}

		enhanceImage(parent)
		expect(parent).toEqual(expected)
	})
})

describe('markdown.ts -> remarkSlideMD', () => {
	it('return split screen with size', () => {
		const tree = {
			type: 'parent',
			children: [
				{
					type: 'html',
					value: '<button>click me</button>'
				},
				{
					type: 'html',
					value: '<!-- .bg-red-100 -->'
				},
				{
					type: 'html',
					value: '<!-- split:30% -->'
				},
				{
					type: 'paragraph',
					children: [
						{
							type: 'text',
							value: 'red'
						},
						{
							type: 'html',
							value: '<!-- .bg-red-500 click-1 -->'
						}
					]
				}
			]
		}

		const expected = {
			type: 'parent',
			children: [
				{
					type: 'parent',
					children: [
						{
							type: 'html',
							value: '<button>click me</button>'
						},
						{
							type: 'html',
							value: '<!-- .bg-red-100 -->'
						}
					],
					data: {
						hName: 'section',
						hProperties: {
							class: 'split-contents'
						}
					}
				},
				{
					type: 'parent',
					children: [
						{
							type: 'html',
							value: '<!-- split:30% -->'
						},
						{
							type: 'paragraph',
							children: [
								{
									type: 'text',
									value: 'red'
								},
								{
									type: 'html',
									value: '<!-- .bg-red-500 click-1 -->'
								}
							],
							data: {
								hProperties: {
									class: 'bg-red-500',
									'click-1': ''
								}
							}
						}
					],
					data: {
						hName: 'section',
						hProperties: {
							class: 'split-contents'
						}
					}
				}
			]
		}

		const processor = remarkSlideMD.call(unified)
		processor?.(tree, new VFile(), () => {})
		expect(tree).toEqual(expected)
	})
})

// describe('shiki test', async () => {
// 	const hast = await highlightHast('package main', 'go')
// 	console.log(hast)

// 	it('adds 1 + 2 to equal 3', () => {
// 		expect(1 + 2).toBe(3)
// 	})
// })
