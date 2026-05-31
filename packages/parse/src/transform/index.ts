import type { Root as MRoot } from 'mdast'
import { Processor } from 'unified'

import { attributeTransformer } from './attribute.js'
import { CodeblockOptions, codeblockTransformer } from './codeblock.js'
import { directiveTransformer } from './directive.js'
import { extractScriptTransformer } from './extract-script.js'

export * from './types.js'

export interface TransformOptions {
	codeblock?: CodeblockOptions
}

export function applyTransformers(
	process: Processor<MRoot, MRoot, undefined, undefined, undefined>,
	options?: TransformOptions
) {
	process.use(codeblockTransformer, options?.codeblock)
	process.use(attributeTransformer)
	process.use(extractScriptTransformer)
	process.use(directiveTransformer)
}
