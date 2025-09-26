import type { Element } from 'hast'
import { describe, expect, test } from 'vitest'
import { transformShiki } from './shiki'

describe('shiki transformer', () => {
	test('should transform code blocks with shiki', async () => {
		const pre = {
			type: 'element',
			tagName: 'pre',
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: { class: ['language-sql'] },
					data: { meta: 'sql' },
					children: [{ type: 'text', value: 'SELECT * FROM users;' }]
				}
			],
			properties: {}
		} as Element

		await transformShiki(pre)

		expect(pre.properties.class).toContain('shiki')
	})

	test('should transform code blocks to plaintext when unknow language', async () => {
		const pre = {
			type: 'element',
			tagName: 'pre',
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: { class: ['language-aaa'] },
					data: { meta: 'aaa' },
					children: [{ type: 'text', value: 'SELECT * FROM users;' }]
				}
			],
			properties: {}
		} as Element

		await transformShiki(pre)

		expect(pre.properties.class).toContain('shiki')
	})
})
