import { Processor } from 'unified'
import { transformerAttribute } from './attribute'
import { transformerCodeblock } from './codeblock'

export function applyTransformers(process: Processor<any, any, any, any>) {
	process.use(transformerCodeblock)
	process.use(transformerAttribute)
}
