import { describe, expect, it } from 'vitest'

import { setupProcessor } from './setup'

describe('header', () => {
	it('should return one line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('# Header1')
		expect(file.value).toEqual('<h1>Header1</h1>')
	})

	it('should return multiple line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('# Header1\n ## Header2')
		expect(file.value).toEqual('<h1>Header1</h1>\n<h2>Header2</h2>')
	})
})

describe('paragraph', () => {
	it('should return one line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('hello, markdown')
		expect(file.value).toEqual('<p>hello, markdown</p>')
	})

	it('should return multiple line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('hello, markdown\nhello, remark')
		expect(file.value).toEqual('<p>hello, markdown\nhello, remark</p>')
	})

	it('should return multiple paragraph', async () => {
		const processor = setupProcessor()

		const file = await processor.process('hello, markdown\n\nhello, remark')
		expect(file.value).toEqual('<p>hello, markdown</p>\n<p>hello, remark</p>')
	})

	it('should return bold', async () => {
		const processor = setupProcessor()

		const file = await processor.process('**hello, markdown**')
		expect(file.value).toEqual('<p><strong>hello, markdown</strong></p>')
	})

	it('should return italic', async () => {
		const processor = setupProcessor()

		const file = await processor.process('*hello, markdown*')
		expect(file.value).toEqual('<p><em>hello, markdown</em></p>')
	})
})

describe('blockquote', () => {
	it('should return one line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('>hello, markdown')
		expect(file.value).toEqual('<blockquote>\n<p>hello, markdown</p>\n</blockquote>')
	})

	it('should return multiple line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('> hello, markdown\nhello, remark\n> hello, svelte')
		expect(file.value).toEqual('<blockquote>\n<p>hello, markdown\nhello, remark\nhello, svelte</p>\n</blockquote>')
	})

	it('should return multiple line and paragraph', async () => {
		const processor = setupProcessor()

		const file = await processor.process('> hello, markdown\n>\n>hello, remark')
		expect(file.value).toEqual('<blockquote>\n<p>hello, markdown</p>\n<p>hello, remark</p>\n</blockquote>')
	})
})

describe('order list', () => {
	it('should return one line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('1. first items')
		expect(file.value).toEqual('<ol>\n<li>first items</li>\n</ol>')
	})

	it('should return multiple line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('1. first items\n2.invalid fromat\n2. second items')
		expect(file.value).toEqual('<ol>\n<li>first items\n2.invalid fromat</li>\n<li>second items</li>\n</ol>')
	})
})

describe('unorder list', () => {
	it('should return one line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('- first items')
		expect(file.value).toEqual('<ul>\n<li>first items</li>\n</ul>')
	})

	it('should return multiple line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('- first items\n-invalid fromat\n- second items')
		expect(file.value).toEqual('<ul>\n<li>first items\n-invalid fromat</li>\n<li>second items</li>\n</ul>')
	})
})

describe('code', () => {
	it('should return code', async () => {
		const processor = setupProcessor()

		const file = await processor.process('`hello, markdown`')
		expect(file.value).toEqual('<p><code>hello, markdown</code></p>')
	})
})

describe('horizontal line', () => {
	it('should return horizontal line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('---')
		expect(file.value).toEqual('<hr>')

		const file2 = await processor.process('------')
		expect(file2.value).toEqual('<hr>')
	})
})

describe('link', () => {
	it('should return one line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('[title](https://www.example.com)')
		expect(file.value).toEqual('<p><a href="https://www.example.com">title</a></p>')
	})

	it('should return multiple line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('[title](https://www.example.com)\n[title](https://www.example.com)')
		expect(file.value).toEqual(
			'<p><a href="https://www.example.com">title</a>\n<a href="https://www.example.com">title</a></p>'
		)
	})

	it('should return quickly', async () => {
		const processor = setupProcessor()

		const file = await processor.process('<https://www.example.com>')
		expect(file.value).toEqual('<p><a href="https://www.example.com">https://www.example.com</a></p>')
	})
})

describe('image', () => {
	it('should return one line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('![alt](https://www.example.com "title")')
		expect(file.value).toEqual('<p><img src="https://www.example.com" alt="alt" title="title"></p>')
	})

	it('should return multiple line', async () => {
		const processor = setupProcessor()

		const file = await processor.process('![alt](https://www.example.com)\n![alt](https://www.example.com)')
		expect(file.value).toEqual(
			'<p><img src="https://www.example.com" alt="alt">\n<img src="https://www.example.com" alt="alt"></p>'
		)
	})

	it('should return multiple line and paragraph', async () => {
		const processor = setupProcessor()

		const file = await processor.process('![alt](https://www.example.com)\n\n![alt](https://www.example.com)')
		expect(file.value).toEqual(
			'<p><img src="https://www.example.com" alt="alt"></p>\n<p><img src="https://www.example.com" alt="alt"></p>'
		)
	})
})
