import { describe, expect, it } from 'vitest'

import { createSlideParser, extractFrontmatter } from '../src'

describe('parser', () => {
	it('create parser', async () => {
		const processor = createSlideParser()
		const resp = await processor.parse('# Slidemd', {})
		expect(resp.slides[0].content).toEqual('<h1>Slidemd</h1>')
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
