import { Processor } from 'unified'

import { attributeBlock, attributeBlockFromMarkdown } from './attribute-block.js'
import { container, containerFromMarkdown } from './container.js'
import { attributeFromMarkdown } from './factory-attribute.js'
import { highlight, highlightFromMarkdown } from './highlight.js'
import { htmlFlow } from './html-flow.js'
import { htmlText } from './html-text.js'
import { subscript, subscriptFromMarkdown } from './subscript.js'
import { superscript, superscriptFromMarkdown } from './superscript.js'
import { svelteBlock } from './svelte-block.js'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './utils.js'

export function slidemdParser(this: Processor) {
	addMicromarkExtensions(
		this,
		highlight,
		subscript,
		superscript,
		htmlFlow,
		htmlText,
		svelteBlock,
		attributeBlock,
		container
	)
	addFromMarkdownExtensions(
		this,
		attributeFromMarkdown,
		highlightFromMarkdown,
		subscriptFromMarkdown,
		superscriptFromMarkdown,
		attributeBlockFromMarkdown,
		containerFromMarkdown
	)
}
