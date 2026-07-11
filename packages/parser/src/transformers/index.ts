import type { Root as MRoot } from 'mdast'
import { Processor } from 'unified'

import { advanceImageTransformer } from './advance-image.js'
import { CodeblockOptions, codeblockTransformer } from './codeblock.js'
import { ContainerOption, containerTransformer } from './container.js'
import { directiveTransformer } from './directive.js'
import { pageBreakTransformer } from './page-break.js'
import { extractScriptTransformer } from './script.js'
import { stepTransformer } from './step.js'

export interface TransformOptions {
	codeblock?: CodeblockOptions
	container?: ContainerOption
}

export function applyTransformers(
	process: Processor<MRoot, MRoot, undefined, undefined, undefined>,
	options?: TransformOptions
) {
	process.use(pageBreakTransformer)
	process.use(codeblockTransformer, options?.codeblock)
	process.use(extractScriptTransformer)
	process.use(directiveTransformer)
	process.use(stepTransformer)
	process.use(advanceImageTransformer)
	process.use(containerTransformer, options?.container)
}
