import { Processor } from 'unified'

import { attribute, attributeFromMarkdown } from './attribute.js'
import { container, containerFromMarkdown } from './container.js'
import { highlight, highlightFromMarkdown } from './highlight.js'
import { htmlFlow } from './html-flow.js'
import { htmlText } from './html-text.js'
import { subscript, subscriptFromMarkdown } from './subscript.js'
import { superscript, superscriptFromMarkdown } from './superscript.js'
import { svelteBlock } from './svelte-block.js'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './uitls.js'

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
