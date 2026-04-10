import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'
import { ignoreRender, slidemdParser } from './parsers'
import { applyTransformers } from './transform'

export const initProcessor = () => {
	const mdastTransform = unified()
		.use(markdown)
		.use(remarkGemoji)
		.use(remarkGfm, { singleTilde: false })
		.use(slidemdParser)

	applyTransformers(mdastTransform)

	const hastTransform = mdastTransform.use(remark2Rehype, {
		handles: ignoreRender(),
		allowDangerousHtml: true
	})

	const processor = hastTransform.use(stringify, {
		allowDangerousHtml: true
	})

	return processor
}
