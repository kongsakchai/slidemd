import { describe, expect, it } from 'vitest'
import { createProcessor } from '../src'

describe('processor', () => {
	it('create processor', async () => {
		const processor = createProcessor()
		const resp = await processor.process('# Slidemd')
		expect(resp.toString()).toEqual('<h1>Slidemd</h1>')
	})
})
