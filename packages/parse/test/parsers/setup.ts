import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'

import { slidemdParser } from '../../src/parsers'

export const setupProcessor = () => {
	const p = unified()
	p.data().micromarkExtensions = undefined
	p.data().micromarkExtensions = undefined

	const mdastTransform = p.use(markdown).use(remarkGemoji).use(remarkGfm, { singleTilde: false }).use(slidemdParser)

	const hastTransform = mdastTransform.use(remark2Rehype, {
		allowDangerousHtml: true
		// allowDangerousCharacters: true
	})

	const processor = hastTransform.use(stringify, {
		allowDangerousHtml: true
		// allowDangerousCharacters: true
	})

	return processor
}
