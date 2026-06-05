import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'
import { describe } from 'vitest'

import { slidemdParser } from '../src/parsers/index'
import { attributeTestcase } from './testcase/parsers/attribute'
import { basicSyntaxTestcase } from './testcase/parsers/basic-syntax'
import { containerTestcase } from './testcase/parsers/container'
import { extendedSyntaxTestcase } from './testcase/parsers/extended-syntax'
import { htmlTestcase } from './testcase/parsers/html'
import { svelteTestcase } from './testcase/parsers/svelte'

describe('all parsers', () => {
	const mdastTransform = unified()
		.use(markdown)
		.use(remarkGemoji)
		.use(remarkGfm, { singleTilde: false })
		.use(slidemdParser)

	const hastTransform = mdastTransform.use(remark2Rehype, {
		allowDangerousHtml: true,
		allowParseErrors: true
	})

	const parser = hastTransform.use(stringify, {
		allowDangerousHtml: true
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
})
