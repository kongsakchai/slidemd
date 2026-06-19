import { describe, expect, it } from 'vitest'

import { createParser } from '../src'

describe('main', () => {
	it('create parser', async () => {
		const processor = createParser()
		const resp = await processor.parse('# Slidemd', {})
		expect(resp.slides[0].content).toEqual('<h1>Slidemd</h1>')
	})
})
