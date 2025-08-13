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
					properties: { class: ['language-js'] },
					data: { meta: 'js' },
					children: [{ type: 'text', value: "console.log('Hello, world!');" }]
				}
			],
			properties: {}
		} as Element

		await transformShiki(pre)

		expect(pre.properties.class).toContain('shiki')
	})
})
