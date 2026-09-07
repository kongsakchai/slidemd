import { describe, expect, it } from 'vitest'

import { createSlideParser, extractFrontmatter } from '../src'

describe('parser', () => {
	it('create parser', async () => {
		const processor = createSlideParser()
		const resp = await processor.parse('# Decko', {})
		expect(resp.slides[0].content).toEqual('<h1>Decko</h1>')
	})

	it('should split slides on thematic breaks and merge global directives', async () => {
		const processor = createSlideParser()
		const resp = await processor.parse(
			`# first

<!--global
color: red
-->

---

# second`,
			{ title: 'base' }
		)

		expect(resp.slides).toHaveLength(2)
		expect(resp.slides[0].content).contain('<h1>first</h1>')
		expect(resp.slides[1].content).contain('<h1>second</h1>')
		expect(resp.slides[1].global).toEqual({ title: 'base', color: 'red' })
	})
})

describe('extract frontmatter', () => {
	it('should return body and frontmatter', async () => {
		const result = extractFrontmatter(`---
data: 10
title: test frontmatter
---
# header`)

		expect(result.body).toEqual('# header')
		expect(result.metadata).toEqual({
			data: 10,
			title: 'test frontmatter'
		})
	})

	it('should return only body', async () => {
		const result = extractFrontmatter(`# header`)

		expect(result.body).toEqual('# header')
		expect(result.metadata).toEqual({})
	})
})
