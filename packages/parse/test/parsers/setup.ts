import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'

import { ignoreRender, slidemdParser } from '../../src/parsers'

export const setupProcessorTestParser = () => {
	const mdastTransform = unified()
		.use(markdown)
		.use(remarkGemoji)
		.use(remarkGfm, { singleTilde: false })
		.use(slidemdParser)

	const hastTransform = mdastTransform.use(remark2Rehype, {
		handlers: ignoreRender(),
		allowDangerousHtml: true
		// allowDangerousCharacters: true
	})

	const processor = hastTransform.use(stringify, {
		allowDangerousHtml: true
		// allowDangerousCharacters: true
	})

	return processor
}
