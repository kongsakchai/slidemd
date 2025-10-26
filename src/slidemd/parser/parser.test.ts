import type { Parent, Root } from 'mdast'
import { unified } from 'unified'
import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'
import { extractFrontmatter, parseSlide } from '.'
import { Context } from './context'
import {
	buildBackgroundStyle,
	buildImageStyle,
	buildSlideStyle,
	calculateSteps,
	combineClassNames,
	combineDirective,
	extractAttributes,
	extractClassNames,
	extractImageAttributes,
	processCodeNode,
	processHTMLNode,
	processImageNode,
	processSvelteSyntax,
	remarkSlideMD
} from './core'
import { highlightHast } from './shiki'

describe('markdown.ts:extractAttributes', () => {
	it('should return attributes with svelte attributes', () => {
		const payload = 'bind:value={value} class:class-1 title:hello bg-color="color-1 color-2" '
		const attrs = extractAttributes(payload)
		expect(attrs).toEqual({
			'bind:value': '{value}',
			'class:class-1': '',
			title: 'hello',
			'bg-color': 'color-1 color-2'
		})
	})
})

describe('markdown.ts:extractClassNames', () => {
	it('should return class', () => {
		const payload = 'class-1 .class-2 .class-3'
		const attrs = extractClassNames(payload)
		expect(attrs).toEqual(['class-2', 'class-3'])
	})
})

describe('markdown.ts:extractImageAttributes', () => {
	const testcases = [
		{
			str: '',
			attrs: {},
			imageAttrs: {}
		},
		{
			str: 'cover 50% 50px',
			attrs: {},
			imageAttrs: {
				fit: '50px'
			}
		},
		{
			str: 'cover x:10px w=100% blur h:300% y="21px" top:99% contrast:3 bottom step-1:click class:class-1 no-repeat absolute bg rx:repeat ry:no-repeat vertical left:10px right:10px bottom:12px',
			attrs: {
				'class:class-1': '',
				'step-1': 'click'
			},
			imageAttrs: {
				filters: ['blur(10px)', 'contrast(3)'],
				fit: 'cover',
				x: '10px',
				y: '21px',
				w: '100%',
				h: '300%',
				pos: 'bottom',
				top: '99%',
				left: '10px',
				right: '10px',
				bottom: '12px',
				repeat: 'no-repeat',
				rx: 'repeat',
				ry: 'no-repeat',
				vertical: true,
				bg: true,
				absolute: true
			}
		}
	]

	testcases.forEach((tc, i) => {
		it(`should return imageAttrs and Attrs #${i}`, () => {
			const { imgAttrs, attrs } = extractImageAttributes(tc.str)
			expect(imgAttrs).toEqual(tc.imageAttrs)
			expect(attrs).toEqual(tc.attrs)
		})
	})
})

describe('markdown.ts:combineClassNames', () => {
	it('should return combine class', () => {
		const classes = combineClassNames(undefined, 'class-1', undefined, 'class-2')
		expect(classes, 'class-1 class-2')
	})
})

describe('markdown.ts:buildImageStyle', () => {
	const testcases = [
		{
			attrs: {},
			styles: undefined
		},
		{
			attrs: {
				filters: ['blur(10px)', 'contrast(3)'],
				fit: 'cover',
				w: '100%',
				h: '300%',
				pos: 'bottom',
				top: '99%',
				left: '10px',
				right: '10px',
				bottom: '12px',
				repeat: 'no-repeat',
				rx: 'repeat',
				ry: 'no-repeat',
				vertical: true,
				bg: true,
				absolute: true
			},
			styles: 'filter: blur(10px) contrast(3);object-position: bottom;object-fit: cover;width: 100%;height: 300%;top: 99%;left: 10px;right: 10px;bottom: 12px;position: absolute'
		},
		{
			attrs: {
				x: '10px',
				pos: 'bottom'
			},
			styles: 'object-position: 10px 50%'
		},
		{
			attrs: {
				y: '10px',
				pos: 'bottom'
			},
			styles: 'object-position: 50% 10px'
		}
	]

	testcases.forEach((tc, i) => {
		it(`should return image styles ${i + 1}`, () => {
			const styles = buildImageStyle(tc.attrs)
			expect(styles).toBe(tc.styles)
		})
	})
})

describe('markdown.ts:buildBackgroundStyle', () => {
	const testcases = [
		{
			attrs: {},
			styles: 'background-image: url(mock.com)'
		},
		{
			attrs: {
				filters: ['blur(10px)', 'contrast(3)'],
				fit: 'cover',
				pos: 'bottom',
				repeat: 'no-repeat',
				vertical: true,
				bg: true,
				absolute: true
			},
			styles: 'background-image: url(mock.com);background-filter: blur(10px) contrast(3);background-position: bottom;background-size: cover;background-repeat: no-repeat'
		},
		{
			attrs: {
				fit: 'cover',
				pos: 'bottom',
				repeat: 'no-repeat',
				x: '10px',
				w: '100%',
				rx: 'repeat'
			},
			styles: 'background-image: url(mock.com);background-position: 10px 50%;background-size: 100% auto;background-repeat: repeat no-repeat'
		},
		{
			attrs: {
				fit: 'cover',
				pos: 'bottom',
				repeat: 'no-repeat',
				y: '10px',
				h: '100%',
				ry: 'repeat'
			},
			styles: 'background-image: url(mock.com);background-position: 50% 10px;background-size: auto 100%;background-repeat: no-repeat repeat'
		}
	]

	testcases.forEach((tc, i) => {
		it(`should return background styles ${i + 1}`, () => {
			const styles = buildBackgroundStyle('mock.com', tc.attrs)
			expect(styles).toBe(tc.styles)
		})
	})
})

describe('markdown.ts:processImageNode', () => {
	it('should return same when no parent', () => {
		const parent = {
			type: 'image',
			url: 'mock3.image.com',
			alt: '',
			children: []
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processImageNode(ctx)

		expect(parent).toEqual({
			type: 'image',
			url: 'mock3.image.com',
			alt: '',
			children: []
		})
	})

	it('should return with starter attributes when no alt', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'image',
					url: 'mock1.image.com'
				}
			]
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processImageNode(ctx)

		expect(parent).toEqual({
			type: 'parent',
			children: [
				{
					type: 'image',
					url: 'mock1.image.com',
					alt: '',
					data: {
						hProperties: {
							absolute: undefined,
							class: undefined,
							loading: 'lazy',
							style: undefined
						}
					}
				}
			]
		})
	})

	it('should return with starter attributes when no alt with 2 order parent', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'image',
							url: 'mock1.image.com'
						}
					]
				}
			]
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processImageNode(ctx)

		expect(parent).toEqual({
			type: 'parent',
			children: [
				{
					type: 'image',
					url: 'mock1.image.com',
					alt: '',
					data: {
						hProperties: {
							absolute: undefined,
							class: undefined,
							loading: 'lazy',
							style: undefined
						}
					}
				}
			]
		})
	})

	it('should return absolute image', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'image',
							url: 'mock.image.com',
							alt: 'img absolute'
						},
						{
							type: 'image',
							url: 'mock2.image.com',
							alt: 'img2 .absolute'
						}
					]
				},
				{
					type: 'image',
					url: 'mock3.image.com',
					alt: 'img3 absolute'
				}
			]
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processImageNode(ctx)

		const p = parent.children[0] as Parent
		expect(p.children[0].data?.hProperties?.absolute).toBe(true)
		expect(p.children[1].data?.hProperties?.absolute).toBe(true)
		expect(parent.children[1].data?.hProperties?.absolute).toBe(true)
	})

	it('should return background image', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'image',
									url: 'mock.image.com',
									alt: 'img bg'
								},
								{
									type: 'image',
									url: 'mock2.image.com',
									alt: 'img2 bg'
								}
							]
						}
					]
				},
				{
					type: 'image',
					url: 'mock3.image.com',
					alt: 'img3 bg'
				}
			]
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processImageNode(ctx)

		expect(parent.children.length).toBe(1)

		const advancedBg = parent.children[0] as Parent
		expect(advancedBg.data?.hProperties?.vertical).toBe(undefined)
		expect(advancedBg.data?.hProperties?.vertical).toBe(undefined)
		expect(advancedBg.children.length).toBe(3)
		expect(advancedBg.children[0].type).toBe('bg-img')
		expect(advancedBg.children[1].type).toBe('bg-img')
		expect(advancedBg.children[2].type).toBe('bg-img')
	})

	it('should return vertical background image', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'image',
									url: 'mock.image.com',
									alt: 'img bg'
								},
								{
									type: 'image',
									url: 'mock2.image.com',
									alt: 'img2 bg vertical'
								}
							]
						}
					]
				},
				{
					type: 'image',
					url: 'mock3.image.com',
					alt: 'img3 bg'
				}
			]
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processImageNode(ctx)

		expect(parent.children.length).toBe(1)

		const advancedBg = parent.children[0] as Parent
		expect(advancedBg.data?.hProperties?.style).contain('--bg-rows')
		expect(advancedBg.children.length).toBe(3)
		expect(advancedBg.children[0].type).toBe('bg-img')
		expect(advancedBg.children[1].type).toBe('bg-img')
		expect(advancedBg.children[2].type).toBe('bg-img')
	})
})

describe('markdown.ts:processCodeNode', () => {
	it('should return same when no parent', async () => {
		const p = {
			type: 'code',
			value: 'this is plaintext',
			children: []
		} as Parent

		const ctx = new Context(p as Root, new VFile())
		await processCodeNode(ctx)

		expect(p).toEqual({
			type: 'code',
			value: 'this is plaintext',
			children: []
		})
	})

	it("should return plaintext when don't assign language", async () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'code',
					value: 'this is plaintext'
				}
			]
		} as Parent

		const ctx = new Context(p as Root, new VFile())
		await processCodeNode(ctx)

		const code = p.children[0] as Parent
		expect(code.data?.hChildren?.length).toBe(3)
		expect(code.data?.hProperties?.class).toContain('language-plaintext')
	})

	it('should return code with attributes', async () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'code',
					lang: 'js',
					meta: '.border-red-500',
					value: 'console.log("hello, world")'
				}
			]
		} as Parent

		const ctx = new Context(p as Root, new VFile())
		await processCodeNode(ctx)

		const code = p.children[0] as Parent
		expect(code.data?.hChildren?.length).toBe(3)
		expect(code.data?.hProperties?.class).toContain('language-js border-red-500')
	})

	it('should return mermaid', async () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'code',
					lang: 'mermaid',
					value: 'this is mermaid'
				}
			]
		} as Parent

		const ctx = new Context(p as Root, new VFile())
		await processCodeNode(ctx)

		expect(p.children[0]).toEqual({
			type: 'mermaid-container',
			data: {
				hName: 'pre',
				hProperties: {
					class: 'mermaid'
				}
			},
			children: [
				{
					type: 'text',
					value: 'this is mermaid'
				}
			]
		})
	})
})

describe('markdown.ts:calculateClickable', () => {
	it('return click with auto click effect', () => {
		const attrs = {
			'step-5': ''
		}

		const click = calculateSteps(10, attrs)

		expect(click).toBe(5)
		expect(attrs).toEqual({
			class: 'opacity-0',
			'step-0': 'opacity-0',
			'step-5': 'opacity-100',
			step: true,
			'use:regisSteps': '{10}'
		})
	})

	it('return click and assign step-0 to class', () => {
		const attrs = {
			class: 'text-green',
			'step-1': 'text-red',
			'step-0': 'text-blue'
		}

		const click = calculateSteps(10, attrs)

		expect(click).toBe(1)
		expect(attrs).toEqual({
			class: 'text-green text-blue',
			'step-1': 'text-red',
			'step-0': 'text-blue',
			step: true,
			'use:regisSteps': '{10}'
		})
	})
})

describe('markdown.ts:buildSlideStyle', () => {
	const testcases = [
		{
			attrs: {},
			expected: undefined
		},
		{
			attrs: {
				_style: 'text-color: red',
				_bgImg: 'mock1.image.com,mock2.image.com,mock3.image.com'
			},
			expected:
				'text-color: red;background-image: url(mock1.image.com), url(mock2.image.com), url(mock3.image.com)'
		},
		{
			attrs: {
				_bgColor: 'red'
			},
			expected: 'background-color: red'
		},
		{
			attrs: {
				_bgColor: 'red'
			},
			expected: 'background-color: red'
		},
		{
			attrs: {
				_bgSize: 'cover'
			},
			expected: 'background-size: cover'
		},
		{
			attrs: {
				_bgPosition: 'center'
			},
			expected: 'background-position: center'
		},
		{
			attrs: {
				_bgRepeat: 'no-repeat'
			},
			expected: 'background-repeat: no-repeat'
		},
		{
			attrs: {
				split: true,
				splitSize: '10px'
			},
			expected: '--split-col: 10px'
		},
		{
			attrs: {
				split: true,
				splitDir: 'vertical',
				splitSize: '10px'
			},
			expected: '--split-row: 10px'
		}
	]

	testcases.forEach((tc, i) => {
		it(`should return slide styles #${i}`, () => {
			const style = buildSlideStyle(tc.attrs)
			expect(style).toBe(tc.expected)
		})
	})
})

describe('markdown.ts:processSvelteSyntax', () => {
	it('should return only text when it has svelte syntax', () => {
		const parent = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'text',
							value: '{#if something}'
						}
					]
				},
				{
					type: 'paragraph',
					children: [
						{
							type: 'text',
							value: 'something'
						}
					]
				}
			]
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processSvelteSyntax(ctx)

		expect(parent.children).toEqual([
			{
				type: 'text',
				value: '{#if something}'
			},
			{
				type: 'paragraph',
				children: [
					{
						type: 'text',
						value: 'something'
					}
				]
			}
		])
	})

	it('should return same when no parent', () => {
		const parent = {
			type: 'paragraph',
			children: [
				{
					type: 'text',
					value: '{#if something}'
				}
			]
		} as Parent

		const ctx = new Context(parent as Root, new VFile())
		processSvelteSyntax(ctx)

		expect(parent).toEqual({
			type: 'paragraph',
			children: [
				{
					type: 'text',
					value: '{#if something}'
				}
			]
		})
	})
})

describe('markdown.ts:combineDirective', () => {
	const testcases = [
		{
			vfile: {},
			attrs: {},
			expectedVFile: {},
			expectedAttrs: {}
		},
		{
			vfile: { paging: true, color: 'red' },
			attrs: { paging: false },
			expectedVFile: { paging: false, color: 'red' },
			expectedAttrs: { _paging: false, paging: false, _color: 'red' }
		},
		{
			vfile: { paging: true },
			attrs: { paging: '-', _paging: true },
			expectedVFile: {},
			expectedAttrs: { _paging: true }
		}
	]

	testcases.forEach((tc, i) => {
		it(`should combineDirective #${i}`, () => {
			const vfile = new VFile()
			vfile.data = tc.vfile
			combineDirective(vfile, tc.attrs)

			expect(tc.vfile, 'vfile').toEqual(tc.expectedVFile)
			expect(tc.attrs, 'attrs').toEqual(tc.expectedAttrs)
		})
	})
})

describe('markdown.ts:remarkSlideMD', () => {
	it('return single screen with attributes', async () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'text',
							value: 'hello'
						},
						{
							type: 'html',
							value: '<!-- .class-2 step-1="click" -->'
						}
					]
				},
				{
					type: 'html',
					value: '<!-- .class-1 -->'
				}
			]
		} as Parent

		const vfile = new VFile()
		vfile.data.page = 10

		await remarkSlideMD.call(unified())?.call(undefined, p, vfile, () => {})

		const contents = p.children[0] as Parent
		expect(contents.children).toEqual([
			{
				type: 'paragraph',
				data: {
					hProperties: {
						class: 'class-2',
						'step-1': 'click',
						step: true,
						'use:regisSteps': '{10}'
					}
				},
				children: [
					{
						type: 'text',
						value: 'hello'
					}
				]
			}
		])
		expect(contents.data?.hProperties?.class).toBe('slide class-1')
		expect(vfile.data.step).toBe(1)
	})

	it('return split screen with attributes', async () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'html',
					value: '<!-- @split class=class-1 -->'
				},
				{
					type: 'html',
					value: '<!-- split -->'
				},
				{
					type: 'paragraph',
					children: [
						{
							type: 'text',
							value: 'hello'
						},
						{
							type: 'html',
							value: '<!-- split:12px -->'
						}
					]
				},
				{
					type: 'html',
					value: '<!-- split:10px -->'
				}
			]
		} as Parent

		await remarkSlideMD.call(unified())?.call(undefined, p, new VFile(), () => {})

		const contents = p.children[0] as Parent
		expect(contents.children).toEqual([
			{
				type: 'split-container',
				children: [],
				data: {
					hName: 'section',
					hProperties: {
						class: 'split-contents class-1',
						style: undefined
					}
				}
			},
			{
				type: 'split-container',
				children: [
					{
						type: 'paragraph',
						children: [
							{
								type: 'text',
								value: 'hello'
							},
							{
								type: 'html',
								value: '<!-- split:12px -->'
							}
						]
					}
				],
				data: {
					hName: 'section',
					hProperties: {
						class: 'split-contents',
						style: undefined
					}
				}
			},
			{
				type: 'split-container',
				children: [],
				data: {
					hName: 'section',
					hProperties: {
						class: 'split-contents',
						style: undefined
					}
				}
			}
		])

		expect(contents.data?.hProperties?.class).toBe('slide split')
	})

	it('return same when no parent', async () => {
		const p = {
			type: 'html',
			value: '<!-- split:10px -->',
			children: []
		} as Parent

		await remarkSlideMD.call(unified())?.call(undefined, p, new VFile(), () => {})

		const contents = p.children[0] as Parent
		expect(contents.children).toEqual([])
	})
})

describe('markdown.ts:processHTMLNode', () => {
	it('should return same when no parent', () => {
		const p = {
			type: 'html',
			value: '<!-- Hello -->',
			children: []
		} as Parent

		const ctx = new Context(p as Root, new VFile())
		processHTMLNode(ctx)

		expect(p).toEqual({
			type: 'html',
			value: '<!-- Hello -->',
			children: []
		})
	})

	it('return single screen with attributes', () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'paragraph',
					children: [
						{
							type: 'text',
							value: 'hello'
						},
						{
							type: 'html',
							value: '<!-- .class-2 step-1="click" -->'
						}
					]
				},
				{
					type: 'html',
					value: '<!-- .class-1 -->'
				},
				{
					type: 'html',
					value: '<div></div>'
				}
			]
		} as Parent

		const vfile = new VFile()
		vfile.data.page = 10

		const ctx = new Context(p as Root, vfile)
		processHTMLNode(ctx)

		expect(p.children).toEqual([
			{
				type: 'paragraph',
				data: {
					hProperties: {
						class: 'class-2',
						'step-1': 'click',
						step: true,
						'use:regisSteps': '{10}'
					}
				},
				children: [
					{
						type: 'text',
						value: 'hello'
					}
				]
			},
			{
				type: 'html',
				value: '<div></div>'
			}
		])
		expect(ctx.directive.class).toBe('class-1')
		expect(ctx.vfile.data.step).toBe(1)
	})

	it('return split screen with attributes', async () => {
		const p = {
			type: 'parent',
			children: [
				{
					type: 'html',
					value: '<!-- @split class=class-1 -->'
				},
				{
					type: 'html',
					value: '<!-- split -->'
				},
				{
					type: 'paragraph',
					children: [
						{
							type: 'text',
							value: 'hello'
						},
						{
							type: 'html',
							value: '<!-- split:12px -->'
						}
					]
				},
				{
					type: 'html',
					value: '<!-- split:10px -->'
				}
			]
		} as Parent

		const ctx = new Context(p as Root, new VFile())
		processHTMLNode(ctx)

		expect(p.children).toEqual([
			{
				type: 'split-container',
				children: [],
				data: {
					hName: 'section',
					hProperties: {
						class: 'split-contents class-1',
						style: undefined
					}
				}
			},
			{
				type: 'split-container',
				children: [
					{
						type: 'paragraph',
						children: [
							{
								type: 'text',
								value: 'hello'
							},
							{
								type: 'html',
								value: '<!-- split:12px -->'
							}
						]
					}
				],
				data: {
					hName: 'section',
					hProperties: {
						class: 'split-contents',
						style: undefined
					}
				}
			},
			{
				type: 'split-container',
				children: [],
				data: {
					hName: 'section',
					hProperties: {
						class: 'split-contents',
						style: undefined
					}
				}
			}
		])

		expect(ctx.directive.split).toBe(true)
		expect(ctx.directive.splitSize).toBe('1fr 10px 1fr')
	})
})

describe('shiki.ts:highlightHast', () => {
	it('should return plaintext when no lang', async () => {
		const codeTree = await highlightHast('console.log("hello, world")', '')

		expect(codeTree.type).toBe('element')
		if ('tagName' in codeTree) {
			expect(codeTree.tagName).toBe('pre')
		}
	})

	it('should return plaintext when unknow lang', async () => {
		const codeTree = await highlightHast('console.log("hello, world")', 'slidemd')

		expect(codeTree.type).toBe('element')
		if ('tagName' in codeTree) {
			expect(codeTree.tagName).toBe('pre')
		}
	})
})

describe('index.ts:extractFrontmatter', () => {
	it('should return body with metadata', () => {
		const code = ['---', 'title: hello, world', 'tags:', '- slide', '- test', '---', '# SlideMD'].join('\n')

		const { body, metadata } = extractFrontmatter(code)

		expect(body).toBe('\n# SlideMD')
		expect(metadata).toEqual({
			title: 'hello, world',
			tags: ['slide', 'test']
		})
	})

	it('should return body without metadata', () => {
		const code = ['--', 'title: hello, world', 'tags:', '- slide', '- test', '---', '# SlideMD'].join('\n')

		const { body, metadata } = extractFrontmatter(code)

		expect(body).toBe(code)
		expect(metadata).toEqual({})
	})
})

describe('index.ts:parseSlide', () => {
	it('should return slide', async () => {
		const code = '# SlideMD\n---\n## Test'
		const slides = await parseSlide(code, {})

		expect(slides.length).toBe(2)
	})
})
