import { Processor } from 'unified'

import { attribute, attributeFromMarkdown } from './attribute.js'
import { container, containerFromMarkdown } from './container.js'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './helper.js'
import { highlight, highlightFromMarkdown } from './highlight.js'
import { htmlFlow } from './html-flow.js'
import { htmlText } from './html-text.js'
import { subscript, subscriptFromMarkdown, superscript, superscriptFromMarkdown } from './subsuper.js'
import { svelteBlock } from './svelte-block.js'

export function slidemdParser(this: Processor) {
	addMicromarkExtensions(
		this,
		highlight,
		subscript,
		superscript,
		attribute,
		htmlFlow,
		htmlText,
		svelteBlock,
		container
	)
	addFromMarkdownExtensions(
		this,
		highlightFromMarkdown,
		subscriptFromMarkdown,
		superscriptFromMarkdown,
		attributeFromMarkdown,
		containerFromMarkdown
	)
}

export function disableRender() {
	const disable = () => undefined

	return {
		attribute: disable
	}
}
