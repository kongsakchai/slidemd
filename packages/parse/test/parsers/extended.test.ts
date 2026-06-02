import { describe, expect, it } from 'vitest'

import { setupProcessor } from './setup'

describe('table', () => {
	it('should return table', async () => {
		const processor = setupProcessor()

		const file = await processor.process('| Col 1 | Col 2 |\n| - | - |')
		expect(file.value).toEqual('<table>\n<thead>\n<tr>\n<th>Col 1</th>\n<th>Col 2</th>\n</tr>\n</thead>\n</table>')
	})

	it('should return table with align', async () => {
		const processor = setupProcessor()

		const file = await processor.process('| Col 1 | Col 2 |\n| -: | :-: |')
		expect(file.value).toEqual(
			'<table>\n<thead>\n<tr>\n<th align="right">Col 1</th>\n<th align="center">Col 2</th>\n</tr>\n</thead>\n</table>'
		)
	})
})

describe('fenced code blocks', () => {
	it('should return without lang', async () => {
		const code = '```\nconsole.log("hello, markdown")\n````'

		const processor = setupProcessor()

		const file = await processor.process(code)
		expect(file.value).toEqual('<pre><code>console.log("hello, markdown")\n</code></pre>')
	})

	it('should return with lang', async () => {
		const code = '```js\nconsole.log("hello, markdown")\n````'

		const processor = setupProcessor()

		const file = await processor.process(code)
		expect(file.value).toEqual('<pre><code class="language-js">console.log("hello, markdown")\n</code></pre>')
	})
})

describe('task list', () => {
	it('should return paragraph when wrong format', async () => {
		const processor = setupProcessor()

		const file = await processor.process('-[] first items\n- [] second items')
		expect(file.value).toEqual('<p>-[] first items</p>\n<ul>\n<li>[] second items</li>\n</ul>')
	})

	it('should return task list', async () => {
		const processor = setupProcessor()

		const file = await processor.process('- [ ] first items\n- [x] second items')
		expect(file.value).toEqual(
			'<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled> first items</li>\n<li class="task-list-item"><input type="checkbox" checked disabled> second items</li>\n</ul>'
		)
	})
})

describe('more', () => {
	it('should return footnote', async () => {
		const processor = setupProcessor()

		const file = await processor.process('Hello, markdown[^1]\n\n[^1]: Hello, markdown.')
		expect(file.value).include(
			'<p>Hello, markdown<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>'
		)
	})

	it('should return strikethrough', async () => {
		const processor = setupProcessor()

		const file = await processor.process('~~strikethrough text~~ normal text')
		expect(file.value).toEqual('<p><del>strikethrough text</del> normal text</p>')
	})

	it('should return emoji', async () => {
		const processor = setupProcessor()

		const file = await processor.process(':tada: :rocket: :seedling:')
		expect(file.value).toEqual('<p>🎉 🚀 🌱</p>')
	})

	it('should return highlight', async () => {
		const processor = setupProcessor()

		let file = await processor.process(`hello, ==markdown==`)
		expect(file.value).toEqual('<p>hello, <mark>markdown</mark></p>')

		file = await processor.process(`==a ==b== c==`)
		expect(file.value).toEqual('<p><mark>a <mark>b</mark> c</mark></p>')
	})

	it('should return highlight with other syntax', async () => {
		const processor = setupProcessor()

		const file = await processor.process(`hello, ==*markdown*==`)
		expect(file.value).toEqual('<p>hello, <mark><em>markdown</em></mark></p>')
	})

	it('should return normal text when escape highligh', async () => {
		const processor = setupProcessor()

		let file = await processor.process(`=\\==markdown===`)
		expect(file.value).toEqual('<p>===markdown===</p>')

		file = await processor.process(`hello, ==\\=markdown==`)
		expect(file.value).toEqual('<p>hello, <mark>=markdown</mark></p>')

		file = await processor.process(`hello, \\==markdown==`)
		expect(file.value).toEqual('<p>hello, ==markdown==</p>')
	})

	it('should return subscript', async () => {
		const processor = setupProcessor()

		let file = await processor.process('h~2~o')
		expect(file.value).toEqual('<p>h<sub>2</sub>o</p>')

		file = await processor.process('`h~2~o`')
		expect(file.value).toEqual('<p><code>h~2~o</code></p>')

		file = await processor.process('h~~~2~~~o')
		expect(file.value).toEqual('<p>h~~~2~~~o</p>')

		file = await processor.process('h~2o')
		expect(file.value).toEqual('<p>h~2o</p>')

		file = await processor.process('~2~')
		expect(file.value).toEqual('<p><sub>2</sub></p>')

		file = await processor.process('==~2~==')
		expect(file.value).toEqual('<p><mark><sub>2</sub></mark></p>')

		file = await processor.process('~a ~b~ c~')
		expect(file.value).toEqual('<p><sub>a <sub>b</sub> c</sub></p>')
	})

	it('should return superscript', async () => {
		const processor = setupProcessor()

		let file = await processor.process('h^2^o')
		expect(file.value).toEqual('<p>h<sup>2</sup>o</p>')

		file = await processor.process('`h^2^o`')
		expect(file.value).toEqual('<p><code>h^2^o</code></p>')

		file = await processor.process('h^^2^^o')
		expect(file.value).toEqual('<p>h^^2^^o</p>')

		file = await processor.process('h^2o')
		expect(file.value).toEqual('<p>h^2o</p>')

		file = await processor.process('^2^')
		expect(file.value).toEqual('<p><sup>2</sup></p>')

		file = await processor.process('==^2^==')
		expect(file.value).toEqual('<p><mark><sup>2</sup></mark></p>')

		file = await processor.process('^a ^b^ c^')
		expect(file.value).toEqual('<p><sup>a <sup>b</sup> c</sup></p>')
	})
})
