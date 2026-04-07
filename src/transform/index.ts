import { Processor } from 'unified'
import { transformerHighlight } from './shiki'

export function applyTransformers(process: Processor<any, any, any, any>) {
	process.use(transformerHighlight)
}
