import { describe, expect, it } from 'vitest'

import { setupProcessor } from './setup'

describe('attribute syntax', () => {
	it('should return only content when attribute parser correctly', async () => {
		const processor = setupProcessor()

		const file = await processor.process('# hello, markdown @{.title} ')
		expect(file.value).toEqual('<h1>hello, markdown </h1>')
	})

	it('should return all and attribute text when attribute not last token', async () => {
		const processor = setupProcessor()

		const file = await processor.process('# hello, markdown @{.title} text')
		expect(file.value).toEqual('<h1>hello, markdown @{.title} text</h1>')
	})

	it('should return all when attribute invalid', async () => {
		const processor = setupProcessor()

		const file = await processor.process('# hello, markdown @{.title')
		expect(file.value).toEqual('<h1>hello, markdown @{.title</h1>')
	})
})
