import { describe, expect, test } from 'vitest'
import { transformImage } from './image'

type image = 'image'

describe('Image Transform Tests', () => {
	test('should parse image with empty alt text', () => {
		const image = {
			type: 'image' as image,
			alt: '',
			url: 'https://example.com/image.png'
		}

		const expectedImage = {
			type: 'image',
			alt: '',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					loading: 'lazy',
					class: '',
					id: '',
					style: 'object-fit: none'
				}
			}
		}

		transformImage(image)

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

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					loading: 'lazy',
					class: 'base-class img-class',
					id: 'base-id img-id',
					style: 'opacity: 0.5; filter: blur(10px); object-fit: fill; object-position: center; width: 20px; height: 30px'
				}
			}
		}

		transformImage(image)
		expect(image).toEqual(expectedImage)
	})

	test('should parse image with object-position: 10% default-y', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image x:10%',
			url: 'https://example.com/image.png'
		}

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					loading: 'lazy',
					class: '',
					id: '',
					style: 'object-fit: none; object-position: 10% 50%'
				}
			}
		}

		transformImage(image)

		expect(image).toEqual(expectedImage)
	})

	test('should parse image with object-position: default-x 10%', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image y:10%',
			url: 'https://example.com/image.png'
		}

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: false,
					loading: 'lazy',
					class: '',
					id: '',
					style: 'object-fit: none; object-position: 50% 10%'
				}
			}
		}

		transformImage(image)

		expect(image).toEqual(expectedImage)
	})

	test('should parse image with absolute positioning', () => {
		const image = {
			type: 'image' as image,
			alt: 'a_sample_image #img-id .img-class absolute top:30px',
			url: 'https://example.com/image.png'
		}

		const expectedImage = {
			type: 'image',
			alt: 'a_sample_image',
			url: 'https://example.com/image.png',
			data: {
				hProperties: {
					isAbsolute: true,
					loading: 'lazy',
					class: 'img-class',
					id: 'img-id',
					style: 'position: absolute; object-fit: none; top: 30px'
				}
			}
		}

		transformImage(image)

		expect(image).toEqual(expectedImage)
	})
})
