import type { Root as MRoot } from 'mdast'
import { Processor } from 'unified'

import { AttributeOptions, attributeTransformer } from './attribute.js'
import { CodeblockOptions, codeblockTransformer } from './codeblock.js'
import { ContainerOptions, containerTransformer } from './container.js'
import { directiveTransformer } from './directive.js'
import { imageTransformer } from './image.js'
import { pageBreakTransformer } from './page-break.js'
import { extractScriptTransformer } from './script.js'

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
