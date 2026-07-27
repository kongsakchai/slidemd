import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import { Processor } from 'unified'

import { attributeBlock, attributeBlockFromMarkdown } from './attribute-block.js'
import { attributeFromMarkdown } from './attribute.js'
import { container, containerFromMarkdown } from './container.js'
import { highlight, highlightFromMarkdown } from './highlight.js'
import { htmlFlow } from './html-flow.js'
import { htmlText } from './html-text.js'
import { imageAttribute, imageAttributeFromMarkdown } from './image-attribute.js'
import { subscript, subscriptFromMarkdown } from './subscript.js'
import { superscript, superscriptFromMarkdown } from './superscript.js'
import { svelteBlock } from './svelte-block.js'

const addMicromarkExtensions = (p: Processor, ...extensions: MicromarkExtension[]) => {
	const data = p.data() as { micromarkExtensions?: MicromarkExtension[] }
	const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = [])
	micromarkExtensions.push(...extensions)
}

const addFromMarkdownExtensions = (p: Processor, ...extensions: FromMarkdownExtension[]) => {
	const data = p.data() as { fromMarkdownExtensions?: Array<FromMarkdownExtension[] | FromMarkdownExtension> }
	const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
	fromMarkdownExtensions.push(...extensions)
}

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
		imageAttributeFromMarkdown
	)
}
