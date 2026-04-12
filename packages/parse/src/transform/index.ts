import { Processor } from 'unified'
import { transformerAttribute } from './attribute'
import { transformerCodeblock } from './codeblock'
import { transformerExteactScript } from './extract-script'

export function applyTransformers(process: Processor<any, any, any, any>) {
	process.use(transformerCodeblock)
	process.use(transformerAttribute)
	process.use(transformerExteactScript)
}
