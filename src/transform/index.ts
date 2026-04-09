import { Processor } from 'unified'
import { transformerCodeHighlight } from './shiki'

export function applyTransformers(process: Processor<any, any, any, any>) {
	process.use(transformerCodeHighlight)
}
