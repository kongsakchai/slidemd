import type { Event, TokenizeContext } from 'micromark-util-types'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import { highlight, highlightFromMarkdown } from '../../src/parsers/highlight'
import { addFromMarkdownExtensions, addMicromarkExtensions, handleResolveAll } from '../../src/parsers/uitls'

describe('helper parsers', () => {
	it("should new micromarkExtensions when it's empty", () => {
		const processor = unified()
		processor.data().micromarkExtensions = undefined

		addMicromarkExtensions(processor, highlight)
		expect(processor.data().micromarkExtensions).toBeDefined()
		expect(processor.data().micromarkExtensions).toHaveLength(1)
	})

	it('should add micromarkExtensions to existing one', () => {
		const processor = unified()
		processor.data().fromMarkdownExtensions = undefined

		addFromMarkdownExtensions(processor, highlightFromMarkdown)
		expect(processor.data().fromMarkdownExtensions).toBeDefined()
		expect(processor.data().fromMarkdownExtensions).toHaveLength(1)
	})

	it('should add original events when construct is undefined', () => {
		const event: Event[] = []
		const resp = handleResolveAll(undefined, event, {} as TokenizeContext)
		expect(resp).toEqual(event)
	})
})
