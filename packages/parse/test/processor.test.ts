import { describe, expect, it } from 'vitest'
import { createParser } from '../src'

describe('processor', () => {
	it('create processor', async () => {
		const processor = createParser()
		const resp = await processor.process('# Slidemd')
		expect(resp.toString()).toEqual('<h1>Slidemd</h1>')
	})
})
