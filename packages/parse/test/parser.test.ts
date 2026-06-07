import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect } from 'vitest'

import { slidemdParser } from '../src/parsers/index'
import { runTest } from './helper'
import { attributeTestcase } from './testcase/parsers/attribute'
import { basicSyntaxTestcase } from './testcase/parsers/basic-syntax'
import { containerTestcase } from './testcase/parsers/container'
import { extendedSyntaxTestcase } from './testcase/parsers/extended-syntax'
import { htmlTestcase } from './testcase/parsers/html'
import { moreTestcase } from './testcase/parsers/more'
import { svelteTestcase } from './testcase/parsers/svelte'

const mdastTransform = unified()
	.use(markdown)
	.use(remarkGemoji)
	.use(remarkGfm, { singleTilde: false })
	.use(slidemdParser)

const hastTransform = mdastTransform.use(remark2Rehype, {
	allowDangerousHtml: true
})

const parser = hastTransform.use(stringify, {
	allowDangerousHtml: true,
	collapseEmptyAttributes: true
})

const parse = async (str: string) => {
	const file = await parser.process(str)
	return file.value.toString()
}

describe('basic syntax', () => {
	basicSyntaxTestcase(parse)
})

describe('extended syntax', () => {
	extendedSyntaxTestcase(parse)
})

describe('svelte syntax', () => {
	svelteTestcase(parse)
})

describe('html syntax', () => {
	htmlTestcase(parse)
})

describe('container syntax', () => {
	containerTestcase(parse)
})

describe('attribute block syntax', () => {
	attributeTestcase(parse)
})

describe('more', () => {
	moreTestcase()
})

describe('helper', () => {
	describe('should run only second testcase when index is 1', () => {
		runTest(
			[
				{
					title: 'should not test me when index is 1',
					value: '',
					expected: ''
				},
				{
					title: 'should test only me when index is 1',
					value: '',
					expected: ''
				}
			],
			1,
			async (t) => {
				expect(t.value).toBe(t.expected)
			}
		)
	})
})
