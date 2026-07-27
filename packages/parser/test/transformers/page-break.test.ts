/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { PAGE_BREAK_KEY, pageBreakTransformer } from '../../src/transformers/page-break'
import { buildVFile, contextOf } from './helper'

describe('page break transformer', () => {
	it('should replace thematic breaks with the page break marker and track slides', () => {
		const tree = {
			type: 'root',
			children: [
				{ type: 'heading', depth: 1, children: [{ type: 'text', value: 'first' }] },
				{ type: 'thematicBreak' },
				{ type: 'heading', depth: 1, children: [{ type: 'text', value: 'second' }] }
			]
		}
		const vfile = buildVFile()

		pageBreakTransformer()(tree, vfile, null as any)

		expect(tree.children[1]).toEqual({ type: 'text', value: PAGE_BREAK_KEY })
		expect(contextOf(vfile).slides).toEqual([{ breakIndex: 0 }, { breakIndex: 1 }])
		expect(tree.children[0].indexGroup).toEqual(0)
		expect(tree.children[2].indexGroup).toEqual(1)
	})

	it('should ignore nodes without a parent', () => {
		const tree = { type: 'thematicBreak' }
		const vfile = buildVFile()

		pageBreakTransformer()(tree, vfile, null as any)

		expect(contextOf(vfile).slides).toEqual([{ breakIndex: 0 }])
	})
})
