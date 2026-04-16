import { Processor } from 'unified'

import { transformerAttribute } from './attribute.js'
import { CodeblockOptions, transformerCodeblock } from './codeblock.js'
import { transformerExteactScript } from './extract-script.js'

export interface TransformOptions {
	codeblock?: CodeblockOptions
}

export function applyTransformers(process: Processor<any, any, any, any>, options?: TransformOptions) {
	process.use(transformerCodeblock, options?.codeblock)
	process.use(transformerAttribute)
	process.use(transformerExteactScript)
}
