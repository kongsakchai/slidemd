/* eslint-disable @typescript-eslint/no-explicit-any */
import { codes } from 'micromark-util-symbol'
import type { Event, Token, TokenizeContext } from 'micromark-util-types'
import markdown from 'remark-parse'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'

import { attributeBlockFromMarkdown } from '../../../src/parsers/attribute-block'
import { containerFromMarkdown } from '../../../src/parsers/container'
import { highlight, highlightFromMarkdown } from '../../../src/parsers/highlight'
import { blankLinePartialTokenizer } from '../../../src/parsers/line'
import { addFromMarkdownExtensions, addMicromarkExtensions, handleResolveAll } from '../../../src/parsers/utils'

export function moreTestcase() {
	describe('utils', () => {
		test("should new micromarkExtensions when it's empty", () => {
			const processor = unified()
			processor.data().micromarkExtensions = undefined
			addMicromarkExtensions(processor, highlight)
			expect(processor.data().micromarkExtensions).toBeDefined()
			expect(processor.data().micromarkExtensions).toHaveLength(1)
		})

		test('should add micromarkExtensions to existing one', () => {
			const processor = unified()
			processor.data().fromMarkdownExtensions = undefined
			addFromMarkdownExtensions(processor, highlightFromMarkdown)
			expect(processor.data().fromMarkdownExtensions).toBeDefined()
			expect(processor.data().fromMarkdownExtensions).toHaveLength(1)
		})

		test('should add original events when construct is undefined', () => {
			const event: Event[] = []
			const resp = handleResolveAll(undefined, event, {} as TokenizeContext)
			expect(resp).toEqual(event)
		})
	})

	describe('blank line', () => {
		test('should return normal text when first token blank line is not line end', () => {
			const processor = unified().use(markdown)
			processor.data().micromarkExtensions = undefined
			addMicromarkExtensions(processor as any, {
				text: { [codes.equalsTo]: blankLinePartialTokenizer }
			})

			const ast = processor.parse('===')
			expect(ast.children[0].type).toBe('paragraph')
		})
	})

	describe('from markdown extension', () => {
		test("should don't assign attribute when last node isn't container", () => {
			const exitContainer = containerFromMarkdown.exit?.['container']

			exitContainer?.call(
				{
					stack: [{ type: 'html', value: '' }],
					exit: (token: Token) => {
						expect(token.type).toBe('attributeBlock')
					}
				} as any,
				{
					type: 'attributeBlock',
					start: { _bufferIndex: 0, _index: 0, offset: 1, line: 1, column: 1 },
					end: { _bufferIndex: 0, _index: 0, offset: 1, line: 1, column: 1 }
				}
			)
		})

		test("should don't assign name when last node isn't container", () => {
			const exitContainer = containerFromMarkdown.exit?.['containerName']

			exitContainer?.call(
				{
					stack: [{ type: 'html', value: '' }]
				} as any,
				{
					type: 'attributeBlock',
					start: { _bufferIndex: 0, _index: 0, offset: 1, line: 1, column: 1 },
					end: { _bufferIndex: 0, _index: 0, offset: 1, line: 1, column: 1 }
				}
			)
		})

		test("should don't assign name when last node isn't attribute block", () => {
			const exitContainer = attributeBlockFromMarkdown.exit?.['attributeBlock']

			exitContainer?.call(
				{
					stack: [{ type: 'html', value: '' }],
					exit: (token: Token) => {
						expect(token.type).toBe('attributeBlock')
					}
				} as any,
				{
					type: 'attributeBlock',
					start: { _bufferIndex: 0, _index: 0, offset: 1, line: 1, column: 1 },
					end: { _bufferIndex: 0, _index: 0, offset: 1, line: 1, column: 1 }
				}
			)
		})
	})
}
