/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { containerTransformer } from '../../src/transformers/container'

const makeContainer = (hName: string, hProperties: any = {}) => ({
	type: 'container',
	data: { hName, hProperties }
})

describe('container transformer', () => {
	it('should keep basic html block names unchanged', () => {
		const tree = { type: 'root', children: [makeContainer('div', { class: 'c' })] }

		containerTransformer()(tree, null as any, null as any)

		expect(tree.children[0].data.hName).toEqual('div')
		expect(tree.children[0].data.hProperties).toEqual({ class: 'c' })
	})

	it('should keep custom container names unchanged', () => {
		const tree = { type: 'root', children: [makeContainer('callout')] }

		containerTransformer({ customContainer: ['callout'] })(tree, null as any, null as any)

		expect(tree.children[0].data.hName).toEqual('callout')
	})

	it('should rewrite unknown container to div with name as class', () => {
		const tree = { type: 'root', children: [makeContainer('banner', { class: 'x' })] }

		containerTransformer()(tree, null as any, null as any)

		expect(tree.children[0].data.hName).toEqual('div')
		expect(tree.children[0].data.hProperties).toEqual({ class: 'banner x' })
	})

	it('should rewrite unknown container without existing class', () => {
		const tree = { type: 'root', children: [makeContainer('banner')] }

		containerTransformer()(tree, null as any, null as any)

		expect(tree.children[0].data.hProperties).toEqual({ class: 'banner' })
	})

	it('should ignore containers without a parent', () => {
		const tree = makeContainer('banner')

		containerTransformer()(tree, null as any, null as any)

		expect(tree.data.hName).toEqual('banner')
	})
})
