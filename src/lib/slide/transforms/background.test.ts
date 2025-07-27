import type { RootContent } from 'mdast'
import { describe, expect, test } from 'vitest'
import { makeBackgroundContainer, parseBackground } from './background'

type image = 'image'

describe('background transform', () => {
	test('should parse background with empty alt text', () => {
		const image = {
			type: 'image' as image,
			alt: '',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with alt text', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image blur cover center round 5px vertical',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-filter: blur(10px); background-size: cover; background-position: center; background-repeat: round',
					isVertical: true,
					sizeGrid: '5px'
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-size: 10px auto', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image w:10px',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-size: 10px auto; background-position: center; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-size: auto 10px', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image h:10px',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-size: auto 10px; background-position: center; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-position: top', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image top',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: top; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-position: 10px 50%', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image x:10px',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: 10px 50%; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-position: 50% 10px', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image y:10px',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: 50% 10px; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-repeat: repeat-x', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image repeat-x',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: repeat-x',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-repeat: repeat no-repeat', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image repeat-x:repeat',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: repeat no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with background-repeat: no-repeat repeat', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image repeat-y:repeat',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: no-repeat repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(0)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with clear parent', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image',
			url: 'https://example.com/image.png'
		}
		const text = {
			type: 'text',
			value: ''
		}
		const parent = { type: 'parent', children: [image, text] as RootContent[] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(1)
		expect(root.children.length).toBe(0)
	})

	test('should parse background with not clear parent', () => {
		const image = {
			type: 'image' as image,
			alt: 'background-image',
			url: 'https://example.com/image.png'
		}
		const text = {
			type: 'text',
			value: 'this text should not clear the parent'
		}
		const parent = { type: 'parent', children: [image, text] as RootContent[] }
		const root = { type: 'parent', children: [parent] as RootContent[] }

		const expectedBg = {
			type: 'bg',
			data: {
				hProperties: {
					class: 'background-image',
					id: '',
					style: 'background-image: url(https://example.com/image.png); background-position: center; background-repeat: no-repeat',
					isVertical: false,
					sizeGrid: ''
				}
			}
		}

		const bg = parseBackground(image, 0, parent, root)

		expect(bg).toEqual(expectedBg)
		expect(parent.children.length).toBe(1)
		expect(root.children.length).toBe(1)
	})
})

describe('makeBackgroundContainer', () => {
	test('should create a background container with horizontal images', () => {
		const images = [
			{
				type: 'bg',
				data: {
					hProperties: {
						isVertical: false,
						sizeGrid: ''
					}
				}
			},
			{
				type: 'bg',
				data: {
					hProperties: {
						isVertical: false,
						sizeGrid: ''
					}
				}
			}
		]

		const expected = {
			type: 'bg-container',
			data: {
				hProperties: {
					class: 'background-container',
					style: '--bg-columns: 1fr 1fr'
				}
			},
			children: images
		}

		const container = makeBackgroundContainer(images)

		expect(container).toEqual(expected)
	})

	test('should create a background container with vertical images', () => {
		const images = [
			{
				type: 'bg',
				data: {
					hProperties: {
						isVertical: true
					}
				}
			},
			{
				type: 'bg',
				data: {
					hProperties: {
						isVertical: false,
						sizeGrid: '2fr'
					}
				}
			}
		]

		const expected = {
			type: 'bg-container',
			data: {
				hProperties: {
					class: 'background-container',
					style: '--bg-rows: 1fr 2fr'
				}
			},
			children: images
		}

		const container = makeBackgroundContainer(images)

		expect(container).toEqual(expected)
	})
})
