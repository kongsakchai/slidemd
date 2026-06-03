import { describe, expect, it } from 'vitest'

import { setupProcessor } from './setup'

describe('container block', () => {
	describe('return container', () => {
		it('should return div without content', async () => {
			const processor = setupProcessor()

			const file = await processor.process(':::div\n:::')
			expect(file.value).toEqual('<div></div>')
		})

		it('should return section without content', async () => {
			const processor = setupProcessor()

			const file = await processor.process(':::section\n:::')
			expect(file.value).toEqual('<section></section>')
		})

		it('should return container with content', async () => {
			const processor = setupProcessor()

			const file = await processor.process(':::div\n# Hello\n:::')
			expect(String(file)).toEqual('<div><h1>Hello</h1></div>')
		})

		it('should return container with multiple content', async () => {
			const processor = setupProcessor()

			const file = await processor.process(':::div\n# Header1\n ## Header2\n:::')
			expect(String(file)).toEqual('<div><h1>Header1</h1><h2>Header2</h2></div>')
		})
	})
})
