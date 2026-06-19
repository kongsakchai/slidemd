import { Processor } from 'unified'

import { attributeBlock, attributeBlockFromMarkdown } from './attribute-block.js'
import { attributeFromMarkdown } from './attribute.js'
import { container, containerFromMarkdown } from './container.js'
import { highlight, highlightFromMarkdown } from './highlight.js'
import { htmlFlow } from './html-flow.js'
import { htmlText } from './html-text.js'
import { attributeImageFromMarkdown, imageAttribute } from './image-attribute.js'
import { subscript, subscriptFromMarkdown } from './subscript.js'
import { superscript, superscriptFromMarkdown } from './superscript.js'
import { svelteBlock } from './svelte-block.js'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './utils.js'

export function slidemdExtension(this: Processor) {
	addMicromarkExtensions(
		this,
		highlight,
		subscript,
		superscript,
		htmlFlow,
		htmlText,
		svelteBlock,
		attributeBlock,
		container,
		imageAttribute
	)
	addFromMarkdownExtensions(
		this,
		attributeFromMarkdown,
		highlightFromMarkdown,
		subscriptFromMarkdown,
		superscriptFromMarkdown,
		attributeBlockFromMarkdown,
		containerFromMarkdown,
		attributeImageFromMarkdown
	)
}
