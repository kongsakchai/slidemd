import { Processor } from 'unified'
import { attribute, attributeFromMarkdown } from './attribute.js'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './helper.js'
import { highlight, highlightFromMarkdown } from './highlight.js'
import { htmlBlock } from './html-block.js'
import { svelteLogicBlock } from './logic-block.js'
import { subscript, subscriptFromMarkdown, superscript, superscriptFromMarkdown } from './subsuper.js'

export function slidemdParser(this: Processor) {
	addMicromarkExtensions(this, highlight(), subscript(), superscript(), attribute(), htmlBlock(), svelteLogicBlock())
	addFromMarkdownExtensions(
		this,
		highlightFromMarkdown(),
		subscriptFromMarkdown(),
		superscriptFromMarkdown(),
		attributeFromMarkdown()
	)
}

export function ignoreRender() {
	const ignore = () => undefined

	return {
		attribute: ignore
	}
}
