import { describe, expect, it } from 'vitest'

import { setupProcessorTestParser } from './setup'

describe('basic html', () => {
	it('should return div tag', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div>hello, markdown</div>')
		expect(file.value).toEqual('<div>hello, markdown</div>')
	})

	it('should return div without close', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div>hello, markdown\n\n# title')
		expect(file.value).toEqual('<div>hello, markdown\n<h1>title</h1>')
	})

	it('should return div with attr', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div class="bg-primary">hello, markdown</div>')
		expect(file.value).toEqual('<div class="bg-primary">hello, markdown</div>')
	})

	it('should return div with data', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div class="{class}">hello, {name.toUpperCase()}</div>')
		expect(file.value).toEqual('<div class="{class}">hello, {name.toUpperCase()}</div>')
	})

	it('should return div without contents', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div />')
		expect(file.value).toEqual('<div />')
	})

	it('should return div with multiple line', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div>\n# hello, markdown\n\n# hello, remark\n\n</div>')
		expect(file.value).toEqual('<div>\n# hello, markdown\n<h1>hello, remark</h1>\n</div>')
	})

	it('should return div with multiple line in attributes', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div\nclass="bg-primary"\n>hello, markdown</div>')
		expect(file.value).toEqual('<div\nclass="bg-primary"\n>hello, markdown</div>')
	})

	it('should return raw', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<script lang="ts" module>\nlet count = $state(0);\n</script>')
		expect(file.value).toEqual('<script lang="ts" module>\nlet count = $state(0);\n</script>')
	})

	it('should return html comment', async () => {
		const processor = setupProcessorTestParser()

		let file = await processor.process('<!-- \nhello, world\n -->')
		expect(file.value).toEqual('<!-- \nhello, world\n -->')

		file = await processor.process('<! -- -->')
		expect(file.value).toEqual('<p>&#x3C;! -- --></p>')

		file = await processor.process('<!- -->')
		expect(file.value).toEqual('<p>&#x3C;!- --></p>')

		file = await processor.process('<!-- ->')
		expect(file.value).toEqual('<!-- ->')
	})

	it('should return instrcutions', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<?php \n?\n?\n ?>')
		expect(file.value).toEqual('<?php \n?\n?\n ?>')
	})

	it('should return cdata', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<!DOCUMENT test>')
		expect(file.value).toEqual('<!DOCUMENT test>')
	})

	it('should return cdata', async () => {
		const processor = setupProcessorTestParser()

		let file = await processor.process('<![CDATA[ \n]\n]]\n ]]>')
		expect(file.value).toEqual('<![CDATA[ \n]\n]]\n ]]>')

		file = await processor.process('<![CDAT[ \n]\n]]\n ]]>')
		expect(file.value).toEqual('<p>&#x3C;![CDAT[\n]\n]]\n]]></p>')

		file = await processor.process('<![CDAT[')
		expect(file.value).toEqual('<p>&#x3C;![CDAT[</p>')
	})

	it('inline html', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('# hello <img src={src} />')
		expect(file.value).toEqual('<h1>hello <img src={src} /></h1>')
	})

	it('inline html with multiple line', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('hello <img\nsrc={src} />')
		expect(file.value).toEqual('<p>hello <img\nsrc={src} /></p>')
	})

	it('should return invalid html', async () => {
		const processor = setupProcessorTestParser()

		let file = await processor.process('<@div>hello, markdown<$div>')
		expect(file.value).toEqual('<p>&#x3C;@div>hello, markdown&#x3C;$div></p>')

		file = await processor.process('<div>hello, markdown</invalid>')
		expect(file.value).toEqual('<div>hello, markdown</invalid>')

		file = await processor.process('<>hello, markdown</>')
		expect(file.value).toEqual('<p>&#x3C;>hello, markdown&#x3C;/></p>')
	})

	it('should return multiple tag', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div><img /></div>')
		expect(file.value).toEqual('<div><img /></div>')

		const file2 = await processor.process('<div><div>555</div></div>')
		expect(file2.value).toEqual('<div><div>555</div></div>')
	})

	it('should return autolink', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<http://www.google.com>')
		expect(file.value).toEqual('<p><a href="http://www.google.com">http://www.google.com</a></p>')

		const file2 = await processor.process('<https://svelte.dev/>')
		expect(file2.value).toEqual('<p><a href="https://svelte.dev/">https://svelte.dev/</a></p>')
	})
})

describe('basic svelte', () => {
	it('should return image src', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<img src={src} alt="{name} dances." />')
		expect(file.value).toEqual('<img src={src} alt="{name} dances." />')
	})

	it('should return image shorthand src', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<img {src} alt="{name} dances." />')
		expect(file.value).toEqual('<img {src} alt="{name} dances." />')
	})

	it('should return inline image shorthand src', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('# title <img {src} alt="{name} dances." />')
		expect(file.value).toEqual('<h1>title <img {src} alt="{name} dances." /></h1>')
	})

	it('should return html block', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('{@html variable}')
		expect(file.value).toEqual('{@html variable}')
	})

	it('should return inline html block', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('hello {@html variable} markdown')
		expect(file.value).toEqual('<p>hello {@html variable} markdown</p>')
	})

	it('should return inline html block in two line', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('hello {@html \nvariable} markdown')
		expect(file.value).toEqual('<p>hello {@html \nvariable} markdown</p>')
	})

	it('should return inline html block and multiple line', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('hello {@html \n\nvariable} markdown')
		expect(file.value).toEqual('<p>hello {@html</p>\n<p>variable} markdown</p>')
	})

	it('should return if block', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('{#if data}')
		expect(file.value).toEqual('{#if data}')
	})

	it('should return if block with multiple line', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('{#if \n\n\ndata \n\n\n}')
		expect(file.value).toEqual('{#if \n\n\ndata \n\n\n}')
	})

	it('should return if block with header', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('{#if data}\n# header1\n## header2\n### header3\n{/if}')
		expect(file.value).toEqual('{#if data}\n<h1>header1</h1>\n<h2>header2</h2>\n<h3>header3</h3>\n{/if}')
	})

	it('should return paragraph and variable', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('{variable}')
		expect(file.value).toEqual('{variable}')
	})

	it('should return paragraph and ternary', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('Age is: {variable >= 0 ? "\\"OLD\\"":"YOUNG"}')
		expect(file.value).toEqual('<p>Age is: {variable >= 0 ? "\\"OLD\\"":"YOUNG"}</p>')
	})

	it('should return logic with multiple line', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('Age is: {variable >= 0 \n?\n""OLD""\n:"YOUNG"}')
		expect(file.value).toEqual('<p>Age is: {variable >= 0 \n?\n""OLD""\n:"YOUNG"}</p>')
	})

	it('should return logic if inline ', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('Age is: {#if variable}')
		expect(file.value).toEqual('<p>Age is: {#if variable}</p>')
	})

	it('should return logic with multiple left curly brace', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('Age is: {{data:10}}')
		expect(file.value).toEqual('<p>Age is: {{data:10}}</p>')
	})

	it('should return custom html', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<A># Hello</A>')
		expect(file.value).toEqual('<A># Hello</A>')
	})

	it('should return html greaster than in attributes', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('<div class=">"></div>')
		expect(file.value).toEqual('<div class=">"></div>')
	})

	it('should return inline html with greaster than in attributes', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('hello <div class=">"></div>')
		expect(file.value).toEqual('<p>hello <div class=">"></div></p>')
	})
})
