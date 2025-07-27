import { describe, expect, test } from 'vitest'
import { parseImage } from './image'

type image = 'image'

describe('Image Transform Tests', () => {
	test('should parse image with empty alt text', () => {
		const image = {
			type: 'image' as image,
			alt: '',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }

		const expectedImage = {
			type: 'image',
			alt: '',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					class: '',
					id: '',
					style: 'object-fit: none'
				}
			}
		}

		parseImage(image, parent)

		expect(image).toEqual(expectedImage)
	})

	test('should parse image with alt text and apply styles', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image #img-id .img-class blur fill center w:20px h:30px',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					class: 'base-class',
					id: 'base-id',
					style: 'opacity: 0.5'
				}
			}
		}
		const parent = { type: 'parent', children: [image] }

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					class: 'base-class img-class',
					id: 'base-id img-id',
					style: 'opacity: 0.5; filter: blur(10px); object-fit: fill; object-position: center; width: 20px; height: 30px'
				}
			}
		}

		parseImage(image, parent)

		expect(image).toEqual(expectedImage)
	})

	test('should parse image with object-position: 10% default-y', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image x:10%',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					class: '',
					id: '',
					style: 'object-fit: none; object-position: 10% 50%'
				}
			}
		}

		parseImage(image, parent)

		expect(image).toEqual(expectedImage)
	})

	test('should parse image with object-position: default-x 10%', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image y:10%',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image] }

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					class: '',
					id: '',
					style: 'object-fit: none; object-position: 50% 10%'
				}
			}
		}

		parseImage(image, parent)

		expect(image).toEqual(expectedImage)
	})

	test('should parse image with absolute and position and parent to be contents', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image absolute top:10px left:20px',
			url: 'https://example.com/image.png'
		}
		const parent = {
			type: 'parent',
			children: [image],
			data: {
				hProperties: {
					style: 'opacity: 0.5'
				}
			}
		}

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					id: '',
					class: '',
					isAbsolute: true,
					style: 'position: absolute; object-fit: none; top: 10px; left: 20px'
				}
			}
		}

		const expectedParent = {
			type: 'parent',
			data: {
				hProperties: {
					style: 'opacity: 0.5; display: contents'
				}
			},
			children: [image]
		}

		parseImage(image, parent)

		expect(image).toEqual(expectedImage)
		expect(parent).toEqual(expectedParent)
	})

	test('should parse image with absolute and position and parent to be contents', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image absolute top:10px left:20px',
			url: 'https://example.com/image.png'
		}
		const image2 = {
			type: 'image' as image,
			alt: 'a_sample_image absolute top:10px left:20px',
			url: 'https://example.com/image.png'
		}
		const parent = { type: 'parent', children: [image, image2] }

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					id: '',
					class: '',
					isAbsolute: true,
					style: 'position: absolute; object-fit: none; top: 10px; left: 20px'
				}
			}
		}

		const expectedParent = {
			type: 'parent',
			children: [image, image2]
		}

		parseImage(image, parent)

		expect(image).toEqual(expectedImage)
		expect(parent).toEqual(expectedParent)
	})
})
