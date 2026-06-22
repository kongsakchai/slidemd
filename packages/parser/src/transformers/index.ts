import type { Root as MRoot } from 'mdast'
import { Processor } from 'unified'

import { advanceImageTransformer } from './advance-image.js'
import { CodeblockOptions, codeblockTransformer } from './codeblock.js'
import { directiveTransformer } from './directive.js'
import { extractScriptTransformer } from './extract-script.js'
import { stepTransformer } from './step.js'

export interface TransformOptions {
	codeblock?: CodeblockOptions
}

export function applyTransformers(
	process: Processor<MRoot, MRoot, undefined, undefined, undefined>,
	options?: TransformOptions
) {
	process.use(codeblockTransformer, options?.codeblock)
	process.use(extractScriptTransformer)
	process.use(directiveTransformer)
	process.use(stepTransformer)
	process.use(advanceImageTransformer)
}
