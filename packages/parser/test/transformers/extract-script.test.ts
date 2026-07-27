/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { extractScriptTransformer } from '../../src/transformers/script'
import { buildVFile, contextOf } from './helper'

describe('extract script', () => {
	it('should extract script and style into the context', () => {
		const tree = {
			type: 'root',
			children: [
				{ type: 'html', value: '<script lang="ts">console.log("Hello")</script>' },
				{ type: 'html', value: '<style>.hello{ background: red; }</style>' },
				{ type: 'html', value: '<h1>Hello</h1>' }
			]
		}
		const vfile = buildVFile()

		extractScriptTransformer()(tree, vfile, null as any)

		const ctx = contextOf(vfile)
		expect(tree.children.length).toEqual(1)
		expect(ctx.script).toEqual(['console.log("Hello")'])
		expect(ctx.style).toEqual(['.hello{ background: red; }'])
	})

	it('should ignore raw tags without a parent', () => {
		const tree = { type: 'html', value: '<script lang="ts">console.log("Hello")</script>' }
		const vfile = buildVFile()

		extractScriptTransformer()(tree, vfile, null as any)

		const ctx = contextOf(vfile)
		expect(ctx.script).toEqual([])
		expect(ctx.style).toEqual([])
	})

	it('should ignore html that is not a script or style tag', () => {
		const tree = {
			type: 'root',
			children: [{ type: 'html', value: '<div>stay</div>' }]
		}
		const vfile = buildVFile()

		extractScriptTransformer()(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(contextOf(vfile).script).toEqual([])
	})
})
