import type { Root as MRoot } from 'mdast'
import { Processor } from 'unified'

import { AttributeOptions, AttributeProcess, attributeTransformer } from './attribute.js'
import { CodeContainer, CodeHighlighter, CodeblockOptions, codeblockTransformer } from './codeblock.js'
import { ContainerOptions, containerTransformer } from './container.js'
import { directiveTransformer, parseYAML } from './directive.js'
import { imageTransformer } from './image.js'
import { PAGE_BREAK_KEY, pageBreakTransformer } from './page-break.js'
import { extractScriptTransformer } from './script.js'

export { PAGE_BREAK_KEY, parseYAML }

export type { AttributeProcess, CodeContainer, CodeHighlighter }

export interface TransformOptions {
	codeblock?: CodeblockOptions
	container?: ContainerOptions
	attribute?: AttributeOptions
}

export function applyTransformers(
	process: Processor<MRoot, MRoot, undefined, undefined, undefined>,
	options?: TransformOptions
) {
	process.use(pageBreakTransformer)
	process.use(codeblockTransformer, options?.codeblock)
	process.use(extractScriptTransformer)
	process.use(directiveTransformer)
	// process.use(stepTransformer)
	process.use(imageTransformer)
	process.use(containerTransformer, options?.container)
	process.use(attributeTransformer, options?.attribute)
}
