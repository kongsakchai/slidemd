// import { describe, expect, it } from 'vitest'

// import { setupProcessorTestParser } from './setup'

// describe('basic svelte', () => {
// 	it('should return image src', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('<img src={src} alt="{name} dances." />')
// 		expect(file.value).toEqual('<img src={src} alt="{name} dances." />')
// 	})

// 	it('should return image shorthand src', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('<img {src} alt="{name} dances." />')
// 		expect(file.value).toEqual('<img {src} alt="{name} dances." />')
// 	})

// 	it('should return inline image shorthand src', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('# title <img {src} alt="{name} dances." />')
// 		expect(file.value).toEqual('<h1>title <img {src} alt="{name} dances." /></h1>')
// 	})

// 	it('should return html block', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('{@html variable}')
// 		expect(file.value).toEqual('{@html variable}')
// 	})

// 	it('should return inline html block', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('hello {@html variable} markdown')
// 		expect(file.value).toEqual('<p>hello {@html variable} markdown</p>')
// 	})

// 	it('should return inline html block in two line', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('hello {@html \nvariable} markdown')
// 		expect(file.value).toEqual('<p>hello {@html \nvariable} markdown</p>')
// 	})

// 	it('should return inline html block and multiple line', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('hello {@html \n\nvariable} markdown')
// 		expect(file.value).toEqual('<p>hello {@html</p>\n<p>variable} markdown</p>')
// 	})

// 	it('should return if block', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('{#if data}')
// 		expect(file.value).toEqual('{#if data}')
// 	})

// 	it('should return if block with multiple line', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('{#if \n\n\ndata \n\n\n}')
// 		expect(file.value).toEqual('{#if \n\n\ndata \n\n\n}')
// 	})

// 	it('should return if block with header', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('{#if data}\n# header1\n## header2\n### header3\n{/if}')
// 		expect(file.value).toEqual('{#if data}\n<h1>header1</h1>\n<h2>header2</h2>\n<h3>header3</h3>\n{/if}')
// 	})

// 	it('should return paragraph and variable', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('{variable}')
// 		expect(file.value).toEqual('{variable}')
// 	})

// 	it('should return paragraph and ternary', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('Age is: {variable >= 0 ? "\\"OLD\\"":"YOUNG"}')
// 		expect(file.value).toEqual('<p>Age is: {variable >= 0 ? "\\"OLD\\"":"YOUNG"}</p>')
// 	})

// 	it('should return logic with multiple line', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('Age is: {variable >= 0 \n?\n""OLD""\n:"YOUNG"}')
// 		expect(file.value).toEqual('<p>Age is: {variable >= 0 \n?\n""OLD""\n:"YOUNG"}</p>')
// 	})

// 	it('should return logic if inline ', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('Age is: {#if variable}')
// 		expect(file.value).toEqual('<p>Age is: {#if variable}</p>')
// 	})

// 	it('should return logic with multiple left curly brace', async () => {
// 		const processor = setupProcessorTestParser()

// 		const file = await processor.process('Age is: {{data:10}}')
// 		expect(file.value).toEqual('<p>Age is: {{data:10}}</p>')
// 	})
// })
