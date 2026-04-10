import { Processor } from 'unified'
import { attribute, attributeFromMarkdown } from './attribute'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './helper'
import { highlight, highlightFromMarkdown } from './highlight'
import { htmlBlock } from './html-block'
import { svelteLogicBlock } from './logic-block'
import { subscript, subscriptFromMarkdown, superscript, superscriptFromMarkdown } from './subsuper'

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
