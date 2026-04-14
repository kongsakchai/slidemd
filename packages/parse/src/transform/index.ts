import { Processor } from 'unified'
import { transformerAttribute } from './attribute'
import { CodeblockOptions, transformerCodeblock } from './codeblock'
import { transformerExteactScript } from './extract-script'

export interface TransformOptions {
	codeblock?: CodeblockOptions
}

export function applyTransformers(process: Processor<any, any, any, any>, options?: TransformOptions) {
	process.use(transformerCodeblock, options?.codeblock)
	process.use(transformerAttribute)
	process.use(transformerExteactScript)
}
