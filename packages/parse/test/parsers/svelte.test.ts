import { describe, expect, it } from 'vitest'

import { setupProcessorTestParser } from './setup'

describe('svelte block', () => {
	describe('block', () => {
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

		it('should return html block with multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{@html \nvariable} this should consume')
			expect(file.value).toEqual('{@html \nvariable} this should consume')
		})

		it('should return if block', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{#if data}')
			expect(file.value).toEqual('{#if data}')
		})

		it('should return if block with header', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{#if data}\n# header1\n## header2\n### header3\n{/if}')
			expect(file.value).toEqual('{#if data}\n<h1>header1</h1>\n<h2>header2</h2>\n<h3>header3</h3>\n{/if}')
		})
	})

	describe('logic block', () => {
		it('should return paragraph and variable', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{variable}')
			expect(file.value).toEqual('<p>{variable}</p>')
		})

		it('should return paragraph and ternary', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('Age is: {variable >= 0 ? "OLD":"YOUNG"}')
			expect(file.value).toEqual('<p>Age is: {variable >= 0 ? "OLD":"YOUNG"}</p>')
		})
	})

	describe('invalid syntax', () => {
		it('should return normal text when start only { and newline', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{\n@html test}')
			expect(file.value).toEqual('<p>{\n@html test}</p>')
		})

		it('should return normal text when invalid character in name block', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{@!html test}')
			expect(file.value).toEqual('<p>{@!html test}</p>')
		})
	})

	describe('interrupt', () => {
		it('should return html block when interrupt', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('Hello\n{@html test}')
			expect(file.value).toEqual('<p>Hello</p>\n{@html test}')
		})
	})
})
