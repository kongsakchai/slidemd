/* eslint-disable @typescript-eslint/no-explicit-any */
import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'

import { extractScriptTransformer } from '../../src/transform/extract-script'

describe('extract script', () => {
	it('should return script', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<script lang="ts">console.log("Hello")</script>'
				},
				{
					type: 'html',
					value: '<style>.hello{ background: red; }</style>'
				},
				{
					type: 'html',
					value: '<h1>Hello</h1>'
				}
			]
		}
		const vfile = new VFile()

		const transformer = extractScriptTransformer()
		transformer(tree, vfile, null as any)

		expect(tree.children.length).toEqual(1)
		expect(vfile.data.scriptTag).toEqual('console.log("Hello")')
		expect(vfile.data.styleTag).toEqual('.hello{ background: red; }')
	})

	it('should return without parent', () => {
		const tree = {
			type: 'html',
			value: '<script lang="ts">console.log("Hello")</script>'
		}
		const vfile = new VFile()

		const transformer = extractScriptTransformer()
		transformer(tree, vfile, null as any)

		expect(vfile.data.script).toEqual(undefined)
		expect(vfile.data.style).toEqual(undefined)
	})
})
