import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'

import { slidemdExtension } from '../../src/extensions/index'

const mdastTransform = unified()
	.use(markdown)
	.use(remarkGemoji)
	.use(remarkGfm, { singleTilde: false })
	.use(slidemdExtension)

const hastTransform = mdastTransform.use(remark2Rehype, {
	allowDangerousHtml: true
})

const parser = hastTransform.use(stringify, {
	allowDangerousHtml: true,
	collapseEmptyAttributes: true
})

export const parse = async (str: string) => {
	const file = await parser.process(str)
	return file.value.toString()
}

// describe('basic syntax', () => {
// 	basicSyntaxTestcase(parse)
// })

// describe('extended syntax', () => {
// 	extendedSyntaxTestcase(parse)
// })

// describe('svelte syntax', () => {
// 	svelteTestcase(parse)
// })

// describe('html syntax', () => {
// 	htmlTestcase(parse)
// })

// describe('container syntax', () => {
// 	containerTestcase(parse)
// })

// describe('attribute block syntax', () => {
// 	attributeTestcase(parse)
// })

// describe('more', () => {
// 	moreTestcase()
// })

// describe('image', () => {
// 	imageTestcase(parse)
// })
